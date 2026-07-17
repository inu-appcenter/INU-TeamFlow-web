'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { subscribeChatRoom } from '@/lib/chatSocket';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@/types/chat';

export function useChatMessageSubscribe(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const sub = subscribeChatRoom(roomId, (frame: IMessage) => {
      const message: ChatMessageResponse = JSON.parse(frame.body);

      queryClient.setQueryData<ChatMessageAnchorResponse>(
        ['chatMessages', 'anchor', roomId],
        (old) => {
          if (!old) return old;
          if (
            old.messages.some((m) => m.chatMessageId === message.chatMessageId)
          ) {
            return old;
          }
          return { ...old, messages: [...old.messages, message] };
        }
      );
    });

    return () => sub.unsubscribe();
  }, [isConnected, roomId, queryClient]);
}
