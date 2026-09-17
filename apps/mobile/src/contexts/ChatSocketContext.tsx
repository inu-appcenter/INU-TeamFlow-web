import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getChatClient, connectChatClient } from "@/lib/chatSocket";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";

interface ChatSocketContextValue {
  isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
  isConnected: false,
});

export const ChatSocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: me } = useMyInfo();
  const userId = me?.userId;
  const [isConnected, setIsConnected] = useState(false);

  // TEMP: stomp.js 없이 순수 WebSocket만으로 같은 증상이 나는지 확인용.
  // 원인 확인되면 이 useEffect 통째로 지우면 됩니다.
  useEffect(() => {
    const testWs = new WebSocket("wss://api-moimi-dev.inuappcenter.kr/ws-chat");
    testWs.onopen = () => console.log("[raw ws] opened");
    testWs.onclose = (e) => console.log("[raw ws] closed", e.code, e.reason);
    testWs.onerror = (e) => console.log("[raw ws] error", e);
    return () => testWs.close();
  }, []);

  useEffect(() => {
    console.log("[chatSocket] effect run, userId =", userId);
    if (!userId) return;

    let mounted = true;
    const client = getChatClient();

    client.debug = (str) => {
      console.log("[STOMP]", str);
    };
    client.onConnect = () => {
      console.log("[chatSocket] connected");
      if (mounted) setIsConnected(true);
    };
    client.onDisconnect = () => {
      console.log("[chatSocket] disconnected");
      if (mounted) setIsConnected(false);
    };
    client.onWebSocketClose = (event) => {
      console.log("[chatSocket] ws closed", event?.code, event?.reason);
      if (mounted) setIsConnected(false);
    };
    client.onWebSocketError = (event) => {
      console.log("[chatSocket] ws error", event);
    };
    client.onStompError = (frame) => {
      console.log(
        "[chatSocket] stomp error",
        frame.headers["message"],
        frame.body
      );
    };

    console.log(
      "[chatSocket] client.active =",
      client.active,
      "connected =",
      client.connected
    );
    if (client.connected) {
      setIsConnected(true);
    }
    if (!client.active) {
      connectChatClient().catch((err) => {
        console.error("채팅 WebSocket 연결 실패", err);
      });
    }

    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <ChatSocketContext.Provider value={{ isConnected }}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocketContext = () => useContext(ChatSocketContext);
