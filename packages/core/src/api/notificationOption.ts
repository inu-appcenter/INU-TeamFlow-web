import { getApiClient } from './client';
import type {
  NotificationOptionRequest,
  NotificationOptionResponse,
} from '@moimi/core/types/notificationOption';

export const getNotificationOptions =
  async (): Promise<NotificationOptionResponse> => {
    const response = await getApiClient().get<NotificationOptionResponse>(
      '/notification-options'
    );

    return response.data;
  };

export const createNotificationOptions = async (
  request: NotificationOptionRequest
): Promise<NotificationOptionResponse> => {
  const response = await getApiClient().post<NotificationOptionResponse>(
    '/notification-options',
    request
  );

  return response.data;
};

export const updateNotificationOptions = async (
  request: NotificationOptionRequest
): Promise<NotificationOptionResponse> => {
  const response = await getApiClient().put<NotificationOptionResponse>(
    '/notification-options',
    request
  );

  return response.data;
};
