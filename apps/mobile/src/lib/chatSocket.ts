import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { secureTokenStorage } from "./tokenStorage";

const httpBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
const wsBaseUrl = httpBaseUrl.replace(/^http/, "ws");
const WS_URL = `${wsBaseUrl}/ws-chat`;

let client: Client | null = null;

export const getChatClient = (): Client => {
  if (client) return client;

  client = new Client({
    // brokerURL 대신 webSocketFactory를 쓰면 stomp.js가 기본으로 붙이는
    // Sec-WebSocket-Protocol(v12.stomp 등) 서브프로토콜 없이 순수 WebSocket으로 연결한다.
    // 프록시가 그 헤더를 제대로 못 넘겨서 연결이 끊기는 문제인지 확인하기 위한 테스트용 설정.
    webSocketFactory: () => new WebSocket(WS_URL),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async () => {
      const token = (await secureTokenStorage.getToken()) ?? "";
      client!.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
    },
    onStompError: (frame) => {
      console.error("STOMP 에러:", frame.headers["message"], frame.body);
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

// client = null로 초기화하면 StrictMode에서 race condition 발생 (engineering-learnings 참고)
// — 그래서 disconnect 시에도 client 참조 자체는 유지한다.
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
    console.warn("STOMP 미연결 상태에서 subscribe 시도 - 무시됨");
    return null;
  }

  return c.subscribe(`/sub/chat-rooms/${roomId}`, onMessage);
};

export const publishChatMessage = (roomId: number, body: unknown): void => {
  const c = getChatClient();

  if (!c.connected) {
    console.warn("STOMP 미연결 상태에서 publish 시도 - 무시됨");
    return;
  }

  c.publish({
    destination: `/pub/chat-rooms/${roomId}/messages`,
    body: JSON.stringify(body),
  });
};

export const subscribeChatRoomRead = (
  roomId: number,
  onMessage: (message: IMessage) => void
): StompSubscription | null => {
  const c = getChatClient();

  if (!c.connected) {
    console.warn("STOMP 미연결 상태에서 subscribe 시도 - 무시됨");
    return null;
  }

  return c.subscribe(`/sub/chat-rooms/${roomId}/read`, onMessage);
};
