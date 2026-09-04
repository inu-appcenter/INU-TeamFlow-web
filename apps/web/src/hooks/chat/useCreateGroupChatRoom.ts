'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroupChatRoom } from '@/api/chat';
import { chatRoomKeys } from '@/hooks/chat/useChatRooms';
import type { GroupChatRoomCreateRequest } from '@/types/chat';

export function useCreateGroupChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GroupChatRoomCreateRequest) => createGroupChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomKeys.base() });
    },
  });
}
