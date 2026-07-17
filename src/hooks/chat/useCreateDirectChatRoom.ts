'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDirectChatRoom } from '@/api/chat';
import { chatRoomKeys } from '@/hooks/chat/useChatRooms';

export const useCreateDirectChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) =>
      createDirectChatRoom({ targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
};
