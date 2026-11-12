import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IMessage } from "@stomp/stompjs";
import { useChatSocketContext } from "@/contexts/ChatSocketContext";
import { getChatClient, subscribeChatRoom } from "@/lib/chatSocket";
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from "@moimi/core/types/chat";

/**
 * @param enabled false면 구독 해제 (화면이 가려졌거나 앱이 백그라운드)
 *                서버가 구독 여부로 푸시 생략을 판단하므로 꼭 해제해야 함
 */
export function useChatMessageSubscription(roomId: number, enabled = true) {
  const { isConnected } = useChatSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !isConnected || !roomId) return;

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
  }, [enabled, isConnected, roomId, queryClient]);
}
