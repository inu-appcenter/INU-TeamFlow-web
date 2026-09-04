'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';

export function useAddChatRoomMembers(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: number[]) => {
      await axiosInstance.post(`/chat-rooms/${roomId}/members`, { userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRoomMembers', roomId] });
      queryClient.invalidateQueries({
        queryKey: ['chatRoomAvailableMembers', roomId],
      });
    },
  });
}
