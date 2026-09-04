import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteNotifications,
  getNotifications,
  readNotification,
  readNotifications,
} from '@moimi/core/api/notification';

import type {
  NotificationFilterType,
  NotificationType,
} from '@moimi/core/types/notification';

export const notificationKeys = {
  all: ['notifications'] as const,

  lists: () => [...notificationKeys.all, 'list'] as const,

  list: (type: NotificationFilterType) =>
    [...notificationKeys.lists(), type] as const,
};

export const useNotifications = (
  filterType: NotificationFilterType,
  size = 10
) => {
  const type: NotificationType | undefined =
    filterType === 'ALL' ? undefined : filterType;

  return useInfiniteQuery({
    queryKey: notificationKeys.list(filterType),
    queryFn: ({ pageParam }) =>
      getNotifications({
        type,
        page: pageParam,
        size,
        sort: ['createdAt,DESC'],
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNext ? allPages.length : undefined,
    retry: (failureCount, error) => {
      const status = (
        error as {
          response?: {
            status?: number;
          };
        }
      ).response?.status;

      if (status && [400, 401, 403, 404].includes(status)) {
        return false;
      }

      return failureCount < 1;
    },
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      readNotifications({
        notificationIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      deleteNotifications({
        notificationIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};
