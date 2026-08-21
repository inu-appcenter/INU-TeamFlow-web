'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMarkChatAsRead } from '@/hooks/chat/useMarkChatAsRead';
import { useMyInfo } from '@/hooks/useAuthQuery';
import { markChatReadKeepalive } from '@/api/chatReadBeacon';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@/types/chat';

const READ_DEBOUNCE_MS = 300;

interface HistoryPage {
  content: ChatMessageResponse[];
}
interface HistoryData {
  pages: HistoryPage[];
  pageParams: unknown[];
}

/**
 * 채팅방 "읽음 상태 전송" 담당 훅.
 *
 *   1) 채팅방 진입(Mount): lastMessageId가 처음 채워지는 순간 읽음 처리
 *   2) 실시간 메시지 수신: 방이 열려 있는 동안 lastMessageId가 갱신될 때마다 읽음 처리
 *   4) 화면 이탈(Unmount)/백그라운드 전환·복귀(visibilitychange): 보류 중인 읽음 위치를
 *      최종 동기화한다.
 *
 * 이 훅은 두 가지 일을 완전히 분리해서 처리한다.
 *
 * A) 내 화면 반영 (로컬, 즉시, 네트워크 상태와 무관):
 *    상대방이 보낸 메시지를 내가 지금 보고 있다는 사실 자체는 서버 응답을 기다릴 필요 없이
 *    바로 내 anchor/history 캐시의 readCount에 반영한다. (내가 "보낸" 메시지는 보낸 시점에
 *    이미 내 몫이 readCount에 들어가 있다고 보고 건드리지 않는다 - 안 그러면 중복 카운트됨)
 *    -> 이게 빠져 있던 게 "내가 방에 들어가도 읽음 표시가 안 없어지는" 버그의 원인이었다.
 *    useChatReadEventSubscription은 내가 보낸 읽음 이벤트의 소켓 echo를 일부러 무시하므로
 *    (상대 읽음 이벤트만 처리하는 훅이라), 내 읽음 반영은 반드시 이 훅에서 직접 해야 한다.
 *
 * B) 서버 동기화 (네트워크, 디바운스 + visibility 인지):
 *    - flushViaMutation: 방을 보고 있는 동안의 정상 케이스.
 *    - flushViaKeepalive: 화면을 벗어나는 순간(백그라운드 전환/탭 종료/언마운트). 일반 요청은
 *      페이지가 unload되면서 취소될 수 있어서 keepalive로 대체한다.
 *    "이미 보낸 값보다 큰 id에 대해서만" 전송하는 가드로 역행/중복 전송을 막는다.
 */
export function useMarkRoomRead(roomId: number, lastMessageId?: number) {
  const { mutate: markAsRead } = useMarkChatAsRead(roomId);
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();

  // render 중에 ref.current를 직접 대입하면 안 되므로(react-hooks/refs),
  // 아래 값들은 전부 effect 안에서만 최신화한다.
  const markAsReadRef = useRef(markAsRead);
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  const roomIdRef = useRef(roomId);
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const currentUserIdRef = useRef(me?.userId);
  useEffect(() => {
    currentUserIdRef.current = me?.userId;
  }, [me?.userId]);

  const queryClientRef = useRef(queryClient);
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  // 서버로 마지막에 "전송"한 읽음 위치. 이 값 이하는 다시 보내지 않는다.
  const lastSentIdRef = useRef(0);
  // 내 화면에 마지막으로 "읽음"으로 반영한 위치. 이 값 이하는 다시 반영(중복 카운트)하지 않는다.
  const lastLocallyReadIdRef = useRef(0);
  const pendingIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  // (fromExclusive, toInclusive] 구간의, 상대방이 보낸 메시지만 readCount +1.
  // anchor/history 경계가 겹칠 때 이중 카운트되지 않도록 anchor 쪽에서 처리한 id는 스킵.
  const applyLocalReadBump = (fromExclusive: number, toInclusive: number) => {
    if (toInclusive <= fromExclusive) return;
    const myId = currentUserIdRef.current;
    const anchorIds = new Set<number>();
    const inRange = (m: ChatMessageResponse) =>
      m.senderId !== myId &&
      m.chatMessageId > fromExclusive &&
      m.chatMessageId <= toInclusive;

    queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
      ['chatMessages', 'anchor', roomIdRef.current],
      (old) => {
        if (!old) return old;
        old.messages.forEach((m) => anchorIds.add(m.chatMessageId));
        return {
          ...old,
          messages: old.messages.map((m) =>
            inRange(m) ? { ...m, readCount: m.readCount + 1 } : m
          ),
        };
      }
    );

    queryClientRef.current.setQueriesData<HistoryData>(
      {
        queryKey: ['chatMessages', 'history', roomIdRef.current],
        exact: false,
      },
      (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((m) =>
              !anchorIds.has(m.chatMessageId) && inRange(m)
                ? { ...m, readCount: m.readCount + 1 }
                : m
            ),
          })),
        };
      }
    );
  };

  const flushViaMutation = () => {
    clearDebounce();
    const id = pendingIdRef.current;
    if (!id || id <= lastSentIdRef.current) return;
    lastSentIdRef.current = id;
    markAsReadRef.current(id);
  };

  const flushViaKeepalive = () => {
    clearDebounce();
    const id = pendingIdRef.current;
    if (!id || id <= lastSentIdRef.current) return;
    lastSentIdRef.current = id;
    markChatReadKeepalive(roomIdRef.current, id);
  };

  // 1) 방 진입 + 2) 실시간 메시지 수신
  useEffect(() => {
    if (!lastMessageId || lastMessageId <= lastLocallyReadIdRef.current) return;

    // A) 내 화면 반영: 네트워크/visibility와 무관하게 즉시 처리
    applyLocalReadBump(lastLocallyReadIdRef.current, lastMessageId);
    lastLocallyReadIdRef.current = lastMessageId;

    // B) 서버 동기화: 탭이 안 보이면 지금 보내지 않고 pending으로만 쌓아둔다.
    pendingIdRef.current = lastMessageId;
    if (document.visibilityState !== 'visible') return;

    clearDebounce();
    debounceTimerRef.current = setTimeout(flushViaMutation, READ_DEBOUNCE_MS);

    return () => clearDebounce();
  }, [lastMessageId]);

  // 4) 백그라운드 전환/복귀, 탭 종료, 언마운트: 보류 중인 읽음 위치 최종 동기화(서버 전송)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushViaKeepalive();
      } else {
        flushViaMutation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushViaKeepalive);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushViaKeepalive);
      flushViaKeepalive(); // 컴포넌트 언마운트(방 이동/뒤로가기 등)
    };
    // roomId가 바뀌면 이 훅을 쓰는 컴포넌트가 key로 리마운트되므로 별도 deps 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
