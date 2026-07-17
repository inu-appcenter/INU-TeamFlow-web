'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { connectChatClient, disconnectChatClient } from '@/lib/chatSocket';
import { useMyInfo } from '@/hooks/useAuthQuery';

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
    if (!userId) return;

    let mounted = true;

    connectChatClient()
      .then(() => {
        if (mounted) setIsConnected(true);
      })
      .catch((err) => {
        console.error('채팅 WebSocket 연결 실패', err);
      });

    return () => {
      mounted = false;
      disconnectChatClient();
      setIsConnected(false);
    };
  }, [userId]); // me 객체 대신 userId 값만 비교

  return (
    <ChatSocketContext.Provider value={{ isConnected }}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocketContext = () => useContext(ChatSocketContext);
