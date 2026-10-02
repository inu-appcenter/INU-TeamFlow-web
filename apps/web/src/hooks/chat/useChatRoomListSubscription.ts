'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { getChatClient, subscribeUserChatRooms } from '@/lib/chatSocket';
import { useMyInfo } from '@moimi/core/hooks/useAuthQuery';
import { chatRoomKeys } from '@moimi/core/hooks/chat/useChatRooms';
import type {
  ChatRoomSummaryResponse,
  ChatRoomListPushPayload,
} from '@moimi/core/types/chat';

/**
 * 채팅방 목록 화면 실시간 갱신 훅.
 * /sub/users/{userId}/chat-rooms 구독 -> 새 메시지/시스템 메시지/읽음 처리 등
 * 어떤 방에서든 변화가 생기면 push됨.
 *
 * 이미 목록에 있는 방이면 lastMessage/lastMessageAt/unreadCount만 갱신한다.
 * 정렬(최근 메시지 순)은 목록 화면에서 lastMessageAt 기준으로 다시 계산되므로
 * 여기서 순서를 직접 바꾸지 않아도 된다.
 *
 * 목록에 없는 새 방(예: 처음 받는 1:1 채팅)은 payload에 roomName/imageUrl 같은
 * 표시 정보가 없어 부분 데이터로 끼워넣지 않고, 해당 타입의 목록을 다시 불러온다.
 */
export function useChatRoomListSubscription() {
  const { isConnected } = useChatSocketContext();
  const { data: me } = useMyInfo();
  const userId = me?.userId;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !userId) return;

    const sub = subscribeUserChatRooms(userId, (frame: IMessage) => {
      const payload: ChatRoomListPushPayload = JSON.parse(frame.body);
      const queryKey = chatRoomKeys.all(payload.roomType);
      const existing =
        queryClient.getQueryData<ChatRoomSummaryResponse[]>(queryKey);

      // 해당 타입의 목록을 아직 한 번도 불러온 적 없으면 손댈 캐시가 없음
      if (!existing) return;

      const roomExists = existing.some(
        (room) => room.chatRoomId === payload.roomId
      );

      if (roomExists) {
        queryClient.setQueryData<ChatRoomSummaryResponse[]>(queryKey, (old) =>
          old?.map((room) =>
            room.chatRoomId === payload.roomId
              ? {
                  ...room,
                  lastMessage: payload.lastMessage.content,
                  lastMessageAt: payload.updatedAt,
                  unreadCount: payload.unreadCount,
                }
              : room
          )
        );
      } else {
        // 새로 생긴 방 - payload만으로는 roomName/imageUrl 등을 채울 수 없어 재조회
        queryClient.invalidateQueries({ queryKey });
      }
    });

    return () => {
      const client = getChatClient();
      if (client.connected) {
        try {
          sub?.unsubscribe();
        } catch {
          // 이미 닫힌 연결에 대한 unsubscribe 실패는 무시
        }
      }
    };
  }, [isConnected, userId, queryClient]);
}
