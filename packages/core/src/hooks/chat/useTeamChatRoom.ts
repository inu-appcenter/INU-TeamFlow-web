'use client';

import { useMemo } from 'react';
import { useChatRooms } from './useChatRooms';

export const useTeamChatRoom = (teamId: number) => {
  const teamQuery = useChatRooms('TEAM');
  const groupQuery = useChatRooms('GROUP');

  const data = useMemo(() => {
    const merged = [...(teamQuery.data ?? []), ...(groupQuery.data ?? [])];
    return merged.filter((room) => room.teamId === teamId);
  }, [teamQuery.data, groupQuery.data, teamId]);

  return {
    data,
    isLoading: teamQuery.isLoading || groupQuery.isLoading,
    isError: teamQuery.isError || groupQuery.isError,
    error: teamQuery.error ?? groupQuery.error,
  };
};
