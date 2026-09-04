'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getChatMessageHistory } from '@moimi/core/api/chat';

export const useChatMessageHistory = (
  roomId: number,
  initialCursor: number | undefined,
  enabled: boolean
) => {
  return useInfiniteQuery({
    queryKey: ['chatMessages', 'history', roomId],
    queryFn: ({ pageParam }) =>
      getChatMessageHistory(roomId, { cursor: pageParam, size: 30 }),
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.content.length === 0) return undefined;
      return lastPage.content[lastPage.content.length - 1].chatMessageId;
    },
    enabled: enabled && !!initialCursor,
  });
};
