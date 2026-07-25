export type NotificationType =
  | 'NOTICE'
  | 'INVITE'
  | 'APPLICATION'
  | 'TEAM_SCHEDULE'
  | 'CHAT';

export type NotificationFilterType = 'ALL' | NotificationType;

export type NotificationItem = {
  notificationId: number;
  title: string;
  content: string;
  type: NotificationType;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  hasNext: boolean;
  unreadCount: number;
  notifications: NotificationItem[];
};

export type NotificationListParams = {
  type?: NotificationType;
  page?: number;
  size?: number;
  sort?: string[];
};

export type NotificationIdsRequest = {
  notificationIds: number[];
};
