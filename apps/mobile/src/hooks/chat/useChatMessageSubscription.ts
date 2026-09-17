import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IMessage } from "@stomp/stompjs";
import { useChatSocketContext } from "@/contexts/ChatSocketContext";
import { getChatClient, subscribeChatRoom } from "@/lib/chatSocket";
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from "@moimi/core/types/chat";

export function useChatMessageSubscription(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const messageSub = subscribeChatRoom(roomId, (frame: IMessage) => {
      const message: ChatMessageResponse = JSON.parse(frame.body);

      queryClient.setQueryData<ChatMessageAnchorResponse>(
        ["chatMessages", "anchor", roomId],
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
      const client = getChatClient();
      if (client.connected) {
        try {
          messageSub?.unsubscribe();
        } catch {
          // 이미 닫힌 연결에 대한 unsubscribe 실패는 무시
        }
      }
    };
  }, [isConnected, roomId, queryClient]);
}
