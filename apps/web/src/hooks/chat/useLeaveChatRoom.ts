'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveChatRoom } from '@/api/chat';
import { chatRoomKeys } from '@/hooks/chat/useChatRooms';

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
}
