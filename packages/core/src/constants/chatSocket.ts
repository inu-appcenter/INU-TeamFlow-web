export const CHAT_WS_ENDPOINT = '/ws-chat';

export const chatSubscribeDestination = (roomId: number) =>
  `/sub/chat-rooms/${roomId}`;
export const chatPublishDestination = (roomId: number) =>
  `/pub/chat-rooms/${roomId}/messages`;
