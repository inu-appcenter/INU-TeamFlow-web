'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { useMyInfo } from '@/hooks/useAuthQuery';
import {
  getChatClient,
  subscribeChatRoom,
  subscribeChatRoomRead,
} from '@/lib/chatSocket';
import type {
  ChatMessageResponse,
  ChatMessageAnchorResponse,
} from '@/types/chat';

interface ChatReadEvent {
  chatRoomId: number;
  userId: number;
  lastReadMessageId: number;
}

export function useChatMessageSubscribe(roomId: number) {
  const { isConnected } = useChatSocketContext();
  const { data: me } = useMyInfo();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const currentUserIdRef = useRef(me?.userId);

  // 유저별로 "이미 반영한 lastReadMessageId"를 기억 (중복 카운트 방지)
  const lastAppliedReadRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    currentUserIdRef.current = me?.userId;
  }, [me?.userId]);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    // 방이 바뀌면 추적 상태 초기화
    lastAppliedReadRef.current = new Map();

    const messageSub = subscribeChatRoom(roomId, (frame: IMessage) => {
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

    const readSub = subscribeChatRoomRead(roomId, (frame: IMessage) => {
      const readEvent: ChatReadEvent = JSON.parse(frame.body);
      console.log(
        '🔵 READ 이벤트 수신:',
        readEvent,
        '| 내 userId:',
        currentUserIdRef.current
      );
      // 내가 보낸 읽음 이벤트는 반영하지 않음
      if (readEvent.userId === currentUserIdRef.current) return;

      const prevLastRead =
        lastAppliedReadRef.current.get(readEvent.userId) ?? 0;

      // 이미 이 지점까지 반영했으면 무시 (중복 방지)
      if (readEvent.lastReadMessageId <= prevLastRead) return;

      queryClientRef.current.setQueryData<ChatMessageAnchorResponse>(
        ['chatMessages', 'anchor', roomId],
        (old) => {
          if (!old) return old;
          const updated = old.messages.map((m) =>
            m.chatMessageId > prevLastRead &&
            m.chatMessageId <= readEvent.lastReadMessageId
              ? { ...m, readCount: m.readCount + 1 }
              : m
          );
          console.log(
            '🟢 readCount 업데이트 대상 개수:',
            updated.filter((m, i) => m.readCount !== old.messages[i].readCount)
              .length
          );
          console.log(
            '🟢 범위:',
            prevLastRead,
            '~',
            readEvent.lastReadMessageId
          );
          return { ...old, messages: updated };
        }
      );

      lastAppliedReadRef.current.set(
        readEvent.userId,
        readEvent.lastReadMessageId
      );
    });

    return () => {
      const client = getChatClient();
      if (client.connected) {
        try {
          messageSub?.unsubscribe();
          readSub?.unsubscribe();
        } catch {
          // 이미 닫힌 연결에 대한 unsubscribe 실패는 무시
        }
      }
    };
  }, [isConnected, roomId]);
}
