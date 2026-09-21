"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatMessageHistory } from "@moimi/core/api/chat";

export const useChatMessageHistory = (
  roomId: number,
  initialCursor: number | undefined,
  enabled: boolean
) => {
  return useInfiniteQuery({
    queryKey: ["chatMessages", "history", roomId],
    queryFn: ({ pageParam }) =>
      getChatMessageHistory(roomId, { cursor: pageParam, size: 30 }),
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => {
      // Spring Slice 응답: last === true 이면 더 이상 이전 메시지 없음
      if (lastPage.last || lastPage.content.length === 0) return undefined;
      // 서버 정렬 방향과 무관하게 "이 페이지에서 가장 오래된 id"를 커서로 사용
      return Math.min(...lastPage.content.map((m) => m.chatMessageId));
    },
    enabled: enabled && !!initialCursor,
  });
};
