'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatRoomMembers } from '@/api/chat';

export function useChatRoomMembers(roomId: number, enabled = true) {
  return useQuery({
    queryKey: ['chatRoomMembers', roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: enabled && !!roomId,
  });
}
