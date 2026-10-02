'use client';

import { useChatRooms } from './useChatRooms';

export const useUnreadChatCount = () => {
  const { data: teamRooms } = useChatRooms('TEAM');
  const { data: directRooms } = useChatRooms('DIRECT');

  const totalUnread =
    (teamRooms ?? []).reduce((sum, r) => sum + r.unreadCount, 0) +
    (directRooms ?? []).reduce((sum, r) => sum + r.unreadCount, 0);

  return totalUnread;
};
