import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSuspendedUsers, releaseReportSanction } from '@/api/admin';

export const SUSPENDED_USERS_KEY = ['admin', 'users', 'suspended'] as const;

export const useSuspendedUsers = (params: { page: number; size?: number }) =>
  useQuery({
    queryKey: [...SUSPENDED_USERS_KEY, params],
    queryFn: () => getSuspendedUsers(params),
  });

export const useReleaseReportSanction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => releaseReportSanction(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUSPENDED_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};
