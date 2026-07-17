'use client';

import { useCallback } from 'react';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { publishChatMessage } from '@/lib/chatSocket';
import type { ChatMessageSendRequest } from '@/types/chat';

export function useSendChatMessage(roomId: number) {
  const { isConnected } = useChatSocketContext();

  const sendMessage = useCallback(
    (payload: Omit<ChatMessageSendRequest, 'roomId'>) => {
      if (!isConnected) {
        console.warn('소켓 미연결 상태');
        return;
      }
      publishChatMessage(roomId, payload);
    },
    [isConnected, roomId]
  );

  return { sendMessage };
}
