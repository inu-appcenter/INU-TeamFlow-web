import axiosInstance from '@/lib/axiosInstance';

import type {
  NotificationIdsRequest,
  NotificationListParams,
  NotificationListResponse,
} from '@/types/notification';

export const getNotifications = (
  params: NotificationListParams = {}
): Promise<NotificationListResponse> => {
  const { type, page = 0, size = 10, sort = ['createdAt,DESC'] } = params;

  return axiosInstance
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
  axiosInstance.patch(`/notifications/${notificationId}`).then(() => undefined);

export const readNotifications = (
  body: NotificationIdsRequest
): Promise<void> =>
  axiosInstance.patch('/notifications', body).then(() => undefined);

export const deleteNotifications = (
  body: NotificationIdsRequest
): Promise<void> =>
  axiosInstance
    .delete('/notifications', {
      data: body,
    })
    .then(() => undefined);
