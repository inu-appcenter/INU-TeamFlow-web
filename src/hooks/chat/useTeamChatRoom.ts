'use client';

import { useChatRooms } from '@/hooks/chat/useChatRooms';

export const useTeamChatRoom = (teamId: number) => {
  const query = useChatRooms('TEAM');

  return {
    ...query,
    data: query.data?.filter((room) => room.teamId === teamId),
  };
};
