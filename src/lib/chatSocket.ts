import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

const httpBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const wsBaseUrl = httpBaseUrl.replace(/^http/, 'ws');
const WS_URL = `${wsBaseUrl}/ws-chat`;

let client: Client | null = null;

export const getChatClient = (): Client => {
  if (client) return client;

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  return client;
};

export const connectChatClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const c = getChatClient();

    if (c.connected) {
      resolve();
      return;
    }

    c.onConnect = () => resolve();
    c.onStompError = (frame) => reject(frame);
    c.activate();
  });
};

export const disconnectChatClient = async (): Promise<void> => {
  if (client && client.connected) {
    await client.deactivate();
  }
  client = null;
};

export const subscribeChatRoom = (
  roomId: number,
  onMessage: (message: IMessage) => void
): StompSubscription | null => {
  const c = getChatClient();

  if (!c.connected) {
    console.warn('STOMP 미연결 상태에서 subscribe 시도 - 무시됨');
    return null;
  }

  return c.subscribe(`/sub/chat-rooms/${roomId}`, onMessage);
};

export const publishChatMessage = (roomId: number, body: unknown): void => {
  const c = getChatClient();
  c.publish({
    destination: `/pub/chat-rooms/${roomId}/messages`,
    body: JSON.stringify(body),
  });
};
