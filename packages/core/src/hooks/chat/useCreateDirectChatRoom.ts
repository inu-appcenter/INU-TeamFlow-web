'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDirectChatRoom } from '@moimi/core/api/chat';
import { chatRoomKeys } from './useChatRooms';

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
