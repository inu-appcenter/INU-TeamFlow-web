'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { useMyInfo } from '@moimi/core/hooks/useAuthQuery';
import { getChatMessageAnchor } from '@moimi/core/api/chat';
import { getChatClient, subscribeChatRoomRead } from '@/lib/chatSocket';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@moimi/core/types/chat';

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
const FIRST_EVENT_RECONCILE_DELAY_MS = 50;

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

export function useChatReadEventSubscription(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const currentUserIdRef = useRef(me?.userId);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

      if (readEvent.userId === currentUserIdRef.current) return;

      const isFirstEventFromThisUser = !counterpartLastReadRef.current.has(
        readEvent.userId
      );

      const prevPosition =
        counterpartLastReadRef.current.get(readEvent.userId) ?? 0;
      if (readEvent.lastReadMessageId <= prevPosition) return;
      counterpartLastReadRef.current.set(
        readEvent.userId,
        readEvent.lastReadMessageId
      );

      if (!isFirstEventFromThisUser) {
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

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const reconcileDelay = isFirstEventFromThisUser
        ? FIRST_EVENT_RECONCILE_DELAY_MS
        : RECONCILE_DEBOUNCE_MS;
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // 주의: queryClient.fetchQuery는 "조용히 값만 받아오는" 함수가 아니라
          // 성공 시 즉시 쿼리 캐시를 그 결과로 덮어쓴다(useQuery의 refetch와 동일한
          // 내부 동작). 그래서 fetchQuery로 받아온 뒤 old와 병합하려고 하면, 이미
          // old 자체가 fetchQuery에 의해 fresh로 오염된 뒤라 병합이 무의미해진다.
          // (이게 실제로 메시지가 사라지던 근본 원인이었음)
          // 캐시를 건드리지 않는 원본 API 함수를 직접 호출해서 이 문제를 피한다.
          const fresh = await getChatMessageAnchor(roomId);

          queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
            ['chatMessages', 'anchor', roomId],
            (old) => {
              if (!old) return fresh;

              const merged = new Map<number, ChatMessageResponse>();
              old.messages.forEach((m) => merged.set(m.chatMessageId, m));
              fresh.messages.forEach((f) => {
                const local = merged.get(f.chatMessageId);
                merged.set(
                  f.chatMessageId,
                  local
                    ? {
                        ...f,
                        readCount: Math.max(local.readCount, f.readCount),
                      }
                    : f
                );
              });

              return {
                ...fresh,
                lastReadMessageId: Math.max(
                  old.lastReadMessageId ?? 0,
                  fresh.lastReadMessageId ?? 0
                ),
                messages: Array.from(merged.values()).sort(
                  (a, b) => a.chatMessageId - b.chatMessageId
                ),
              };
            }
          );
        } catch {
          // 재검증 실패는 조용히 무시
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
