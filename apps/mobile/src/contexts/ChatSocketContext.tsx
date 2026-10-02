import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getChatClient,
  connectChatClient,
  disconnectChatClient,
} from "@/lib/chatSocket";
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
      // userId가 바뀌었다는 건 로그아웃했거나 다른 계정으로 로그인했다는 뜻.
      // 이전 세션 연결을 여기서 끊어야, 다음 effect가 새 토큰으로 재연결한다.
      disconnectChatClient();
    };
  }, [userId]);

  return (
    <ChatSocketContext.Provider value={{ isConnected }}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocketContext = () => useContext(ChatSocketContext);
