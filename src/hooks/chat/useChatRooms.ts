'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatRooms } from '@/api/chat';
import type { ChatRoomType } from '@/types/chat';

export const chatRoomKeys = {
  base: () => ['chatRooms'] as const,
  all: (type: ChatRoomType) => ['chatRooms', type] as const,
};

export const useChatRooms = (type: ChatRoomType) => {
  return useQuery({
    queryKey: chatRoomKeys.all(type),
    queryFn: () => getChatRooms({ type }),
  });
};
