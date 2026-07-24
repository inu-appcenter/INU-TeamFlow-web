'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import type { ChatRoomMemberResponse } from '@/types/chat';

export function useChatRoomMembers(roomId: number, enabled = true) {
  return useQuery({
    queryKey: ['chatRoomMembers', roomId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ChatRoomMemberResponse[]>(
        `/chat-rooms/${roomId}/members`
      );
      return data;
    },
    enabled: enabled && !!roomId,
  });
}
