import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNotificationOptions,
  getNotificationOptions,
  updateNotificationOptions,
} from '@/api/notificationOption';
import type {
  NotificationOptionRequest,
  NotificationOptionResponse,
} from '@/types/notificationOption';

export const notificationOptionKeys = {
  all: ['notification-options'] as const,
};

const DEFAULT_NOTIFICATION_OPTIONS: NotificationOptionRequest = {
  noticeEnabled: false,
  inviteEnabled: false,
  applicationEnabled: false,
  calendarEnabled: false,
  chatEnabled: false,
};

const getOrCreateNotificationOptions =
  async (): Promise<NotificationOptionResponse> => {
    try {
      return await getNotificationOptions();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        try {
          return await createNotificationOptions(DEFAULT_NOTIFICATION_OPTIONS);
        } catch (createError) {
          // 동시에 다른 요청에서 생성됐을 가능성
          if (
            axios.isAxiosError(createError) &&
            createError.response?.status === 409
          ) {
            return await getNotificationOptions();
          }

          throw createError;
        }
      }

      throw error;
    }
  };

export const useNotificationOptions = () =>
  useQuery({
    queryKey: notificationOptionKeys.all,
    queryFn: getOrCreateNotificationOptions,

    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status && status >= 400 && status < 500) {
          return false;
        }
      }

      return failureCount < 1;
    },

    refetchOnWindowFocus: false,
  });

export const useUpdateNotificationOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationOptions,

    onSuccess: (data) => {
      queryClient.setQueryData(notificationOptionKeys.all, data);
    },
  });
};
