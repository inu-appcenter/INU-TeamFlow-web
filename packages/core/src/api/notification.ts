import { getApiClient } from './client';

import type {
  NotificationIdsRequest,
  NotificationListParams,
  NotificationListResponse,
} from '@moimi/core/types/notification';

export const getNotifications = (
  params: NotificationListParams = {}
): Promise<NotificationListResponse> => {
  const { type, page = 0, size = 10, sort = ['createdAt,DESC'] } = params;

  return getApiClient()
    .get('/notifications', {
      params: {
        type,
        page,
        size,
        sort,
      },
    })
    .then((response) => response.data);
};

export const readNotification = (notificationId: number): Promise<void> =>
  getApiClient().patch(`/notifications/${notificationId}`).then(() => undefined);

export const readNotifications = (
  body: NotificationIdsRequest
): Promise<void> =>
  getApiClient().patch('/notifications', body).then(() => undefined);

export const deleteNotifications = (
  body: NotificationIdsRequest
): Promise<void> =>
  getApiClient()
    .delete('/notifications', {
      data: body,
    })
    .then(() => undefined);
