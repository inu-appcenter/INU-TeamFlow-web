'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatMessageAnchor } from '@/api/chat';

export const useChatMessageAnchor = (roomId: number) => {
  return useQuery({
    queryKey: ['chatMessages', 'anchor', roomId],
    queryFn: () => getChatMessageAnchor(roomId),
    enabled: !!roomId,
  });
};
