'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { useMyInfo } from '@/hooks/useAuthQuery';
import { getChatClient, subscribeChatRoomRead } from '@/lib/chatSocket';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@/types/chat';

interface ChatReadEvent {
  chatRoomId: number;
  userId: number;
  lastReadMessageId: number;
}

interface HistoryPage {
  content: ChatMessageResponse[];
}

interface HistoryData {
  pages: HistoryPage[];
  pageParams: unknown[];
}

const RECONCILE_DEBOUNCE_MS = 800;

function bumpReadCount(
  messages: ChatMessageResponse[],
  lastReadMessageId: number,
  skipIds?: Set<number>
): ChatMessageResponse[] {
  return messages.map((m) => {
    if (skipIds?.has(m.chatMessageId)) return m; // 다른 캐시에서 이미 반영됨 -> 중복 카운트 방지
    return m.chatMessageId <= lastReadMessageId
      ? { ...m, readCount: m.readCount + 1 }
      : m;
  });
}

/**
 * 상대방이 이 방의 메시지를 읽었다는 소켓 이벤트(요구사항 3단계)를 구독해서
 * anchor/history 캐시의 readCount, lastReadMessageId를 실시간으로 반영하는 훅.
 *
 * 새 메시지 자체를 append하는 로직은 useChatMessageSubscription이 담당한다
 * (관심사 분리: "메시지 수신" vs "읽음 이벤트 수신").
 *
 * 주의해서 처리한 두 가지 문제:
 * 1) anchor.messages와 history(무한스크롤 과거 메시지) 캐시 경계가 겹칠 때
 *    같은 메시지를 두 캐시에서 각각 카운트해 이중 증가하는 문제
 *    -> anchor 쪽에서 이미 반영한 메시지 id는 history 패치에서 스킵
 * 2) 800ms 뒤 재검증(fetchQuery) 결과가 방금 반영한 낙관적 값보다 오래된
 *    스냅샷일 수 있어, 통째로 덮어쓰면 값이 잠깐 역행하는 문제
 *    -> readCount/lastReadMessageId는 항상 "더 큰 값"으로만 병합
 */
export function useChatReadEventSubscription(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const currentUserIdRef = useRef(me?.userId);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    currentUserIdRef.current = me?.userId;
  }, [me?.userId]);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const readSub = subscribeChatRoomRead(roomId, (frame: IMessage) => {
      const readEvent: ChatReadEvent = JSON.parse(frame.body);
      console.log('[read-event]', {
        readEvent,
        myUserId: currentUserIdRef.current,
        filtered: readEvent.userId === currentUserIdRef.current,
      }); // 임시 확인용

      // 내가 보낸 읽음 이벤트는 반영하지 않음 (내 읽음 상태는 useMarkRoomRead가 직접 관리)
      if (readEvent.userId === currentUserIdRef.current) return;

      // anchor 캐시에서 실제로 갱신된 메시지 id들을 기록 (history 이중 카운트 방지용)
      const anchorMessageIds = new Set<number>();

      queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
        ['chatMessages', 'anchor', roomId],
        (old) => {
          if (!old) return old;
          old.messages.forEach((m) => anchorMessageIds.add(m.chatMessageId));
          return {
            ...old,
            lastReadMessageId: Math.max(
              old.lastReadMessageId ?? 0,
              readEvent.lastReadMessageId
            ),
            messages: bumpReadCount(old.messages, readEvent.lastReadMessageId),
          };
        }
      );

      queryClientRef.current.setQueriesData<HistoryData>(
        { queryKey: ['chatMessages', 'history', roomId], exact: false },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: bumpReadCount(
                page.content,
                readEvent.lastReadMessageId,
                anchorMessageIds
              ),
            })),
          };
        }
      );

      // 짧은 시간 내 여러 read 이벤트가 몰리면 재검증은 한 번만 (서버 부하 방지).
      // 재검증 결과는 통째로 덮어쓰지 않고, readCount/lastReadMessageId는
      // 더 큰 값으로만 병합해서 절대 역행하지 않게 한다.
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const fresh =
            await queryClientRef.current.fetchQuery<ChatMessageAnchorResponse>({
              queryKey: ['chatMessages', 'anchor', roomId],
            });

          queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
            ['chatMessages', 'anchor', roomId],
            (old) => {
              if (!old) return fresh;
              return {
                ...fresh,
                lastReadMessageId: Math.max(
                  old.lastReadMessageId ?? 0,
                  fresh.lastReadMessageId ?? 0
                ),
                messages: fresh.messages.map((f) => {
                  const local = old.messages.find(
                    (m) => m.chatMessageId === f.chatMessageId
                  );
                  return local
                    ? {
                        ...f,
                        readCount: Math.max(local.readCount, f.readCount),
                      }
                    : f;
                }),
              };
            }
          );
        } catch {
          // 재검증 실패는 조용히 무시 (다음 이벤트에서 다시 시도됨)
        }
      }, RECONCILE_DEBOUNCE_MS);
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      const client = getChatClient();
      if (client.connected) {
        try {
          readSub?.unsubscribe();
        } catch {
          // 이미 닫힌 연결에 대한 unsubscribe 실패는 무시
        }
      }
    };
  }, [isConnected, roomId]);
}
