'use client';

import { useCallback } from 'react';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { publishChatMessage } from '@/lib/chatSocket';
import { startAnalyticsAttempt } from '@/lib/analytics';
import type { ChatMessageSendRequest } from '@moimi/core/types/chat';

export function useSendChatMessage(roomId: number) {
  const { isConnected } = useChatSocketContext();

  const sendMessage = useCallback(
    (payload: ChatMessageSendRequest) => {
      const attempt = startAnalyticsAttempt('message_send', {
        feature: 'chat',
        attempt_scope: 'client_publish',
        chat_room_id: roomId,
        message_type:
          payload.messageType === 'TEXT' || payload.messageType === 'IMAGE'
            ? payload.messageType
            : undefined,
      });

      if (!isConnected) {
        attempt.fail(null, {
          kind: 'network',
          reason_code: 'SOCKET_NOT_CONNECTED',
        });

        console.warn('소켓 미연결 상태');
        return;
      }

      try {
        const published = publishChatMessage(roomId, payload);

        if (!published) {
          attempt.fail(null, {
            kind: 'network',
            reason_code: 'SOCKET_NOT_CONNECTED',
          });
          return;
        }

        attempt.succeed();
      } catch (error) {
        attempt.fail(error, {
          reason_code: 'SOCKET_PUBLISH_FAILED',
        });
        throw error;
      }
    },
    [isConnected, roomId]
  );

  return { sendMessage };
}
