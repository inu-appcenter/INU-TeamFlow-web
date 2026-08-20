import { getHttpStatus } from '@/utils/httpError';
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
      if (getHttpStatus(error) === 404) {
        try {
          return await createNotificationOptions(DEFAULT_NOTIFICATION_OPTIONS);
        } catch (createError) {
          if (getHttpStatus(createError) === 409) {
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
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useUpdateNotificationOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationOptions,

    onMutate: async (request) => {
      await queryClient.cancelQueries({
        queryKey: notificationOptionKeys.all,
      });

      const previous = queryClient.getQueryData<NotificationOptionResponse>(
        notificationOptionKeys.all
      );

      const optimisticData: NotificationOptionResponse = {
        ...request,
        allEnabled:
          request.noticeEnabled &&
          request.inviteEnabled &&
          request.applicationEnabled &&
          request.calendarEnabled &&
          request.chatEnabled,
      };

      queryClient.setQueryData(notificationOptionKeys.all, optimisticData);

      return { previous };
    },

    onError: (_error, _request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationOptionKeys.all, context.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(notificationOptionKeys.all, data);
    },
  });
};
