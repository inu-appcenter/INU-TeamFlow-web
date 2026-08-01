'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { getChatClient, subscribeChatRoom } from '@/lib/chatSocket';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@/types/chat';

export function useChatMessageSubscribe(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const sub = subscribeChatRoom(roomId, (frame: IMessage) => {
      const message: ChatMessageResponse = JSON.parse(frame.body);

      queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
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

    return () => {
      // 언마운트 시점에 소켓이 이미 닫혀있으면 unsubscribe 시도 자체를 스킵
      const client = getChatClient();
      if (sub && client.connected) {
        try {
          sub.unsubscribe();
        } catch {
          // 이미 닫힌 연결에 대한 unsubscribe 실패는 무시
        }
      }
    };
  }, [isConnected, roomId]);
}
