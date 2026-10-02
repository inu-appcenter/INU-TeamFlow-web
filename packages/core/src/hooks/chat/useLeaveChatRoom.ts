'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveChatRoom } from '@moimi/core/api/chat';
import { chatRoomKeys } from './useChatRooms';

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
}
