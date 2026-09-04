'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroupChatRoom } from '@moimi/core/api/chat';
import { chatRoomKeys } from './useChatRooms';
import type { GroupChatRoomCreateRequest } from '@moimi/core/types/chat';

export function useCreateGroupChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GroupChatRoomCreateRequest) => createGroupChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
}
