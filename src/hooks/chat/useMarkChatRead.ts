import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markChatRead } from '@/api/chat';
import type { ChatReadRequest } from '@/types/chat';

export const useMarkChatRead = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChatReadRequest) => markChatRead(roomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};
