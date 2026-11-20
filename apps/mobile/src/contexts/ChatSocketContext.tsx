import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
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

// 백그라운드 진입 후 소켓을 끊기까지 대기 시간
// 채팅방 구독 해제(UNSUBSCRIBE)가 먼저 서버에 가도록 잠깐 기다림
const BACKGROUND_DISCONNECT_DELAY_MS = 500;

export const ChatSocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: me } = useMyInfo();
  const userId = me?.userId;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    let backgroundTimer: ReturnType<typeof setTimeout> | null = null;
    let backgroundAt: number | null = null;
    const client = getChatClient();

    client.onConnect = () => {
      if (mounted) setIsConnected(true);
    };
    client.onDisconnect = () => {
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

    if (client.connected) {
      setIsConnected(true);
    }
    if (!client.active) {
      connectChatClient().catch((err) => {
        console.error("채팅 WebSocket 연결 실패", err);
      });
    }

    // 백그라운드: 소켓 연결을 끊어서 서버가 "접속 중"으로 판단하지 않게 함 → 채팅 푸시 수신
    // 포그라운드 복귀: 다시 연결 → 화면에 있는 구독 훅들이 isConnected를 보고 재구독
    const appStateSub = AppState.addEventListener("change", (status) => {
      if (status === "background") {
        backgroundAt = Date.now();
        if (backgroundTimer) clearTimeout(backgroundTimer);
        backgroundTimer = setTimeout(() => {
          backgroundTimer = null;
          disconnectChatClient();
        }, BACKGROUND_DISCONNECT_DELAY_MS);
        return;
      }

      if (status === "active") {
        const wasAwayLong =
          backgroundAt !== null &&
          Date.now() - backgroundAt >= BACKGROUND_DISCONNECT_DELAY_MS;
        backgroundAt = null;

        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
          backgroundTimer = null;
        }

        if (wasAwayLong) {
          // 백그라운드 동안 OS가 소켓을 끊었을 수 있음 (타이머가 못 돌았거나 끊는 도중 정지)
          // → 살아 있는 척하는 연결을 즉시 버리고 새로 연결
          setIsConnected(false);
          client.deactivate({ force: true }).finally(() => {
            if (mounted) client.activate();
          });
          return;
        }

        // 아주 잠깐(0.5초 미만) 나갔다 온 경우: 기존 연결 유지
        if (!client.active) {
          client.activate();
        }
      }
    });

    return () => {
      mounted = false;
      appStateSub.remove();
      if (backgroundTimer) clearTimeout(backgroundTimer);
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
