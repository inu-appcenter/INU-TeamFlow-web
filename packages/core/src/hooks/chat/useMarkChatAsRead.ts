'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markChatRead } from '@moimi/core/api/chat';
import { chatRoomKeys } from './useChatRooms';

export const useMarkChatAsRead = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lastReadMessageId: number) =>
      markChatRead(roomId, { lastReadMessageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
};
