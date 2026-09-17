import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";
import { useMarkChatAsRead } from "@moimi/core/hooks/chat/useMarkChatAsRead";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from "@moimi/core/types/chat";

const READ_DEBOUNCE_MS = 300;

interface HistoryPage {
  content: ChatMessageResponse[];
}
interface HistoryData {
  pages: HistoryPage[];
  pageParams: unknown[];
}

export function useMarkRoomRead(
  roomId: number,
  lastMessageId?: number,
  initialLastReadMessageId?: number
) {
  const { mutate: markAsRead } = useMarkChatAsRead(roomId);
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();

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

  const initialLastReadMessageIdRef = useRef(initialLastReadMessageId);
  useEffect(() => {
    initialLastReadMessageIdRef.current = initialLastReadMessageId;
  }, [initialLastReadMessageId]);

  const lastSentIdRef = useRef(0);
  const lastLocallyReadIdRef = useRef(0);
  const hasSeededInitialPositionRef = useRef(false);
  const pendingIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const applyLocalReadBump = (fromExclusive: number, toInclusive: number) => {
    if (toInclusive <= fromExclusive) return;
    const myId = currentUserIdRef.current;
    const anchorIds = new Set<number>();
    const inRange = (m: ChatMessageResponse) =>
      m.senderId !== myId &&
      m.chatMessageId > fromExclusive &&
      m.chatMessageId <= toInclusive;

    queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
      ["chatMessages", "anchor", roomIdRef.current],
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
        queryKey: ["chatMessages", "history", roomIdRef.current],
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

  const flush = () => {
    clearDebounce();
    const id = pendingIdRef.current;
    if (!id || id <= lastSentIdRef.current) return;
    lastSentIdRef.current = id;
    markAsReadRef.current(id);
  };

  // 1) 방 진입 + 2) 실시간 메시지 수신
  useEffect(() => {
    if (!lastMessageId) return;

    if (!hasSeededInitialPositionRef.current) {
      hasSeededInitialPositionRef.current = true;
      lastLocallyReadIdRef.current = initialLastReadMessageIdRef.current ?? 0;
    }

    if (lastMessageId <= lastLocallyReadIdRef.current) return;

    applyLocalReadBump(lastLocallyReadIdRef.current, lastMessageId);
    lastLocallyReadIdRef.current = lastMessageId;

    pendingIdRef.current = lastMessageId;
    if (AppState.currentState !== "active") return;

    clearDebounce();
    debounceTimerRef.current = setTimeout(flush, READ_DEBOUNCE_MS);

    return () => clearDebounce();
  }, [lastMessageId]);

  // 4) 백그라운드 전환/복귀, 화면 이탈(언마운트): 보류 중인 읽음 위치 최종 동기화
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (_next: AppStateStatus) => {
        flush();
      }
    );

    return () => {
      subscription.remove();
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
