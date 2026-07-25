import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

const httpBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const wsBaseUrl = httpBaseUrl.replace(/^http/, 'ws');
const WS_URL = `${wsBaseUrl}/ws-chat`;

let client: Client | null = null;

export const getChatClient = (): Client => {
  if (client) return client;

  client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: () => {
      const token = localStorage.getItem('accessToken') ?? '';
      client!.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
    },
    onStompError: (frame) => {
      console.error('STOMP 에러:', frame.headers['message'], frame.body);
    },
  });

  return client;
};

export const connectChatClient = (): Promise<void> => {
  const c = getChatClient();

  if (c.connected) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const originalOnConnect = c.onConnect;
    const originalOnStompError = c.onStompError;

    c.onConnect = (frame) => {
      originalOnConnect?.(frame);
      resolve();
    };
    c.onStompError = (frame) => {
      originalOnStompError?.(frame);
      reject(frame);
    };

    if (!c.active) {
      c.activate();
    }
  });
};

export const disconnectChatClient = async (): Promise<void> => {
  if (client) {
    await client.deactivate();
  }
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

  if (!c.connected) {
    console.warn('STOMP 미연결 상태에서 publish 시도 - 무시됨');
    return;
  }

  c.publish({
    destination: `/pub/chat-rooms/${roomId}/messages`,
    body: JSON.stringify(body),
  });
};
