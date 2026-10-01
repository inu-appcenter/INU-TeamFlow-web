'use client';

import type { QueryClient } from '@tanstack/react-query';
import { getChatRooms } from '@moimi/core/api/chat';
import type {
  ChatMessageResponse,
  ChatRoomSummaryResponse,
  ChatRoomType,
} from '@moimi/core/types/chat';
import { ANALYTICS_EVENTS } from '@moimi/core/constants/analytics';
import { capture, getActorId } from './client';
import { safeId } from './httpContext';

const observedMessages = new Set<string>();
const MAX_OBSERVED_MESSAGES = 5000;

async function findChatRoom(
  queryClient: QueryClient,
  userId: number,
  roomId: number
): Promise<ChatRoomSummaryResponse | undefined> {
  const queryKey = ['analytics', 'chatRooms', userId] as const;

  const cached = queryClient.getQueryData<ChatRoomSummaryResponse[]>(queryKey);
  const cachedRoom = cached?.find((room) => room.chatRoomId === roomId);

  if (cachedRoom) return cachedRoom;

  const roomTypes: ChatRoomType[] = ['TEAM', 'GROUP', 'DIRECT'];

  const rooms = await queryClient.fetchQuery({
    queryKey,
    queryFn: async () => {
      const lists = await Promise.all(
        roomTypes.map((type) => getChatRooms({ type }))
      );

      return lists.flat();
    },
    staleTime: 0,
    retry: false,
  });

  return rooms.find((room) => room.chatRoomId === roomId);
}

export function trackConfirmedChatMessage(
  message: ChatMessageResponse,
  userId: number | undefined,
  queryClient: QueryClient
): void {
  if (!message || userId == null || message.senderId !== userId) return;

  if (message.messageType !== 'TEXT' && message.messageType !== 'IMAGE') {
    return;
  }

  const roomId = safeId(message.chatRoomId);
  const messageId = safeId(message.chatMessageId);
  const senderId = safeId(userId);

  if (!roomId || !messageId || !senderId) return;

  const messageKey = `${roomId}:${messageId}`;
  const observedKey = `${senderId}:${messageKey}`;

  if (observedMessages.has(observedKey)) return;

  observedMessages.add(observedKey);

  if (observedMessages.size > MAX_OBSERVED_MESSAGES) {
    const oldest = observedMessages.values().next().value;
    if (oldest !== undefined) observedMessages.delete(oldest);
  }

  const actorId = getActorId();
  const createdAt =
    typeof message.createdAt === 'string' ? Date.parse(message.createdAt) : NaN;

  const properties = {
    feature: 'chat',
    interaction_type: 'participation',
    operation: 'message_send',
    actor_id: actorId,
    chat_room_id: roomId,
    chat_message_id: messageId,
    message_key: messageKey,
    message_type: message.messageType,
    confirmation_stage: 'server_message',
    activity_occurred_at: Number.isFinite(createdAt)
      ? new Date(createdAt).toISOString()
      : undefined,
  };

  capture('chat_message_sent', properties);

  void findChatRoom(queryClient, userId, message.chatRoomId)
    .then((room) => {
      if (getActorId() !== actorId) return;

      if (
        !room ||
        (room.chatRoomType !== 'TEAM' && room.chatRoomType !== 'GROUP')
      ) {
        return;
      }

      const teamId = safeId(room.teamId);
      if (!teamId) return;

      capture(ANALYTICS_EVENTS.TEAM_ACTIVITY_COMPLETED, {
        ...properties,
        team_id: teamId,
        activity_type: 'message_send',
      });
    })
    .catch(() => {});
}
