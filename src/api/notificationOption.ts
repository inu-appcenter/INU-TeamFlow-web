import axiosInstance from '@/lib/axiosInstance';
import type {
  NotificationOptionRequest,
  NotificationOptionResponse,
} from '@/types/notificationOption';

export const getNotificationOptions =
  async (): Promise<NotificationOptionResponse> => {
    const response = await axiosInstance.get<NotificationOptionResponse>(
      '/notification-options'
    );

    return response.data;
  };

export const createNotificationOptions = async (
  request: NotificationOptionRequest
): Promise<NotificationOptionResponse> => {
  const response = await axiosInstance.post<NotificationOptionResponse>(
    '/notification-options',
    request
  );

  return response.data;
};

export const updateNotificationOptions = async (
  request: NotificationOptionRequest
): Promise<NotificationOptionResponse> => {
  const response = await axiosInstance.put<NotificationOptionResponse>(
    '/notification-options',
    request
  );

  return response.data;
};
