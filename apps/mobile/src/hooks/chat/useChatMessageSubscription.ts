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
    console.log(
      "[chatSub] effect run, isConnected =",
      isConnected,
      "roomId =",
      roomId
    );
    if (!isConnected || !roomId) return;

    const messageSub = subscribeChatRoom(roomId, (frame: IMessage) => {
      console.log("[chatSub] 메시지 프레임 수신:", frame.body);
      const message: ChatMessageResponse = JSON.parse(frame.body);

      queryClient.setQueryData<ChatMessageAnchorResponse>(
        ["chatMessages", "anchor", roomId],
        (old) => {
          console.log(
            "[chatSub] 캐시 업데이트 시도, old 존재?",
            !!old,
            "old.messages.length =",
            old?.messages.length
          );
          if (!old) return old;
          if (
            old.messages.some((m) => m.chatMessageId === message.chatMessageId)
          ) {
            console.log("[chatSub] 중복 메시지, 스킵:", message.chatMessageId);
            return old;
          }
          console.log("[chatSub] 새 메시지 추가:", message.chatMessageId);
          return { ...old, messages: [...old.messages, message] };
        }
      );
    });

    console.log(
      "[chatSub] subscribe 결과:",
      messageSub ? "구독 성공" : "구독 실패(null)"
    );

    return () => {
      console.log("[chatSub] cleanup, unsubscribe 시도");
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
