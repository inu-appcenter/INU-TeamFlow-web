'use client';

import { useChatSocketContext } from '@/contexts/ChatSocketContext';

export const useChatSocketConnection = () => {
  return useChatSocketContext();
};
