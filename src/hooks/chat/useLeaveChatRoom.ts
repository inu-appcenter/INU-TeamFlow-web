'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      await axiosInstance.delete(`/chat-rooms/${roomId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}
