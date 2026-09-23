import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IMessage } from "@stomp/stompjs";
import { useChatSocketContext } from "@/contexts/ChatSocketContext";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { getChatClient, subscribeChatRoomRead } from "@/lib/chatSocket";
import { getChatMessageAnchor } from "@moimi/core/api/chat";
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from "@moimi/core/types/chat";

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
          ["chatMessages", "anchor", roomId],
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
          { queryKey: ["chatMessages", "history", roomId], exact: false },
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
          // queryClient.fetchQuery()는 성공 시 결과를 캐시에 바로 써버려서
          // 그 다음 setQueryData의 old가 이미 fresh와 같아지고 union merge가
          // 무의미해진다. 캐시를 건드리지 않는 순수 API 호출을 직접 쓴다.
          const fresh = await getChatMessageAnchor(roomId);

          queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
            ["chatMessages", "anchor", roomId],
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
