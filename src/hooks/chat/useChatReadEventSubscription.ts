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
// 세션 중 카운터파트를 처음 보는 이벤트는 곧바로(사실상 디바운스 없이) 재검증한다.
// 낙관적 반영을 건너뛰기 때문에, 진짜 값을 최대한 빨리 받아와야 화면이 계속 낡은 값으로 남지 않는다.
const FIRST_EVENT_RECONCILE_DELAY_MS = 50;

/**
 * (fromExclusive, toInclusive] 구간의 메시지만 readCount +1.
 *
 * - readerId 본인이 보낸 메시지는 제외한다. (자기 메시지는 원래부터 "읽음"으로
 *   취급돼야 하고, 본인의 읽음 이벤트로 또 카운트되면 안 된다.)
 * - skipIds로 다른 캐시(anchor)에서 이미 반영한 id는 스킵해 이중 카운트를 막는다.
 */
function bumpReadCount(
  messages: ChatMessageResponse[],
  readerId: number | undefined,
  fromExclusive: number,
  toInclusive: number,
  skipIds?: Set<number>
): ChatMessageResponse[] {
  return messages.map((m) => {
    if (skipIds?.has(m.chatMessageId)) return m;
    if (m.senderId === readerId) return m;
    return m.chatMessageId > fromExclusive && m.chatMessageId <= toInclusive
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
 * 주의해서 처리한 문제들:
 * 1) anchor.messages와 history(무한스크롤 과거 메시지) 캐시 경계가 겹칠 때
 *    같은 메시지를 두 캐시에서 각각 카운트해 이중 증가하는 문제
 *    -> anchor 쪽에서 이미 반영한 메시지 id는 history 패치에서 스킵
 * 2) 800ms 뒤 재검증(fetchQuery) 결과가 방금 반영한 낙관적 값보다 오래된
 *    스냅샷일 수 있어, 통째로 덮어쓰면 값이 잠깐 역행하는 문제
 *    -> readCount/lastReadMessageId는 항상 "더 큰 값"으로만 병합
 * 3) (다인원 방 전용, 새로 발견) 같은 유저가 읽음 이벤트를 "두 번 이상" 보낼 수 있다는 문제
 *    -> 예: B가 메시지를 읽어서 이벤트①(lastReadMessageId=142)이 오고, 곧이어 B가 새 메시지를
 *       보내면 B 자신의 읽음 위치도 함께 갱신되어 이벤트②(lastReadMessageId=144)가 또 온다.
 *       기존 코드는 "id <= lastReadMessageId인 메시지는 전부 +1"이라서, 142번 메시지가
 *       이벤트①에서 한 번, 이벤트②에서 또 한 번 — 총 두 번 카운트됐다.
 *       1:1 채팅에서는 상대가 1명뿐이라 readCount가 0/1로만 클램프돼 안 보였지만(0->1->clamp),
 *       3명 이상 방에서는 실제 값(1)보다 부풀려진 값(2)이 그대로 배지에 노출돼(0으로 표시)
 *       보였다가, 재검증 시점에 서버 값과 병합되며 다시 원래 값(1)처럼 보이는 깜빡임으로 드러남.
 *    -> 유저별로 "마지막으로 반영한 읽음 위치"를 기억해두고, 새 이벤트가 오면 그 위치보다
 *       "더 뒤쪽" 구간만 카운트하도록 수정. 같은 유저의 이벤트가 여러 번 와도 겹치는 구간은
 *       다시 카운트되지 않는다.
 * 4) (3번을 고친 뒤에도 남아있던 잔여 깜빡임) 이번 세션에서 어떤 카운터파트의 "첫" 읽음
 *    이벤트가 오면, 3번 수정으로는 prevPosition을 0으로 볼 수밖에 없다. 근데 그 유저가
 *    세션 시작 전에 이미 읽어서 서버 readCount에 반영되어 있던 메시지까지 (0, R] 범위에
 *    포함되면, 이미 반영된 걸 또 낙관적으로 +1 해버려서 잠깐 부풀었다가(배지가 사라짐)
 *    재검증(reconcile)에서야 다시 정확한 값으로 돌아오는 깜빡임이 남아있었다.
 *    -> 서버가 카운터파트별 "이전 읽음 위치"를 따로 안 내려주기 때문에 정확한 시작점을
 *       알 방법이 없다. 그래서 각 카운터파트의 "세션 내 첫 이벤트"는 낙관적으로 반영하지
 *       않고 위치만 기록해두고, 대신 재검증을 거의 즉시(디바운스 없이) 실행해 서버의
 *       진짜 값을 빨리 받아온다. 같은 카운터파트의 두 번째 이벤트부터는 이제 진짜
 *       prevPosition을 알고 있으므로 안전하게 낙관적 반영을 한다.
 */
export function useChatReadEventSubscription(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const currentUserIdRef = useRef(me?.userId);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 카운터파트(나 아닌 다른 방 참여자)별 "마지막으로 반영한 읽음 위치".
  // roomId가 바뀌면 이 훅을 쓰는 컴포넌트가 key={roomId}로 통째로 리마운트되므로
  // 방을 옮길 때마다 자동으로 새로 초기화된다.
  const counterpartLastReadRef = useRef<Map<number, number>>(new Map());

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

      // 내가 보낸 읽음 이벤트는 반영하지 않음 (내 읽음 상태는 useMarkRoomRead가 직접 관리)
      if (readEvent.userId === currentUserIdRef.current) return;

      // 이 유저를 이번 세션에서 처음 보는 건지 먼저 확인 (낙관적 반영 여부를 가른다).
      const isFirstEventFromThisUser = !counterpartLastReadRef.current.has(
        readEvent.userId
      );

      // 이 유저가 이번 세션에서 마지막으로 반영된 위치보다 "더 뒤로" 간 경우에만,
      // 그 사이 구간만 새로 카운트한다. 오래되었거나(<=) 중복된 이벤트는 무시.
      const prevPosition =
        counterpartLastReadRef.current.get(readEvent.userId) ?? 0;
      if (readEvent.lastReadMessageId <= prevPosition) return;
      counterpartLastReadRef.current.set(
        readEvent.userId,
        readEvent.lastReadMessageId
      );

      // 세션 내 이 유저의 "첫" 이벤트는 진짜 이전 위치(prevPosition)를 알 수 없으므로
      // 낙관적으로 반영하지 않는다 (0이라고 가정하고 반영하면, 세션 시작 전에 이미
      // 읽어서 서버 값에 반영돼 있던 메시지까지 또 카운트해 잠깐 부풀 수 있다).
      // 대신 아래에서 재검증을 거의 즉시 실행해 서버의 진짜 값을 빠르게 받아온다.
      if (!isFirstEventFromThisUser) {
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
              messages: bumpReadCount(
                old.messages,
                readEvent.userId,
                prevPosition,
                readEvent.lastReadMessageId
              ),
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
                  readEvent.userId,
                  prevPosition,
                  readEvent.lastReadMessageId,
                  anchorMessageIds
                ),
              })),
            };
          }
        );
      }

      // 짧은 시간 내 여러 read 이벤트가 몰리면 재검증은 한 번만 (서버 부하 방지).
      // 단, 이 유저의 첫 이벤트라 낙관적 반영을 건너뛴 경우엔 화면이 낡은 값으로 오래
      // 남아있지 않도록 거의 즉시 재검증한다.
      // 재검증 결과는 통째로 덮어쓰지 않고, readCount/lastReadMessageId는
      // 더 큰 값으로만 병합해서 절대 역행하지 않게 한다.
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const reconcileDelay = isFirstEventFromThisUser
        ? FIRST_EVENT_RECONCILE_DELAY_MS
        : RECONCILE_DEBOUNCE_MS;
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
      }, reconcileDelay);
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
