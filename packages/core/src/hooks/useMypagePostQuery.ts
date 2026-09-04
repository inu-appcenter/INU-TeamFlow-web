import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelApplication,
  getMyApplications,
  getMyRecruitments,
  getMyTeamNotices,
} from '@moimi/core/api/mypagePost';

export const mypagePostKeys = {
  all: () => ['mypage-posts'] as const,
  recruitments: () => ['mypage-posts', 'recruitments'] as const,
  applications: () => ['mypage-posts', 'applications'] as const,
  notices: () => ['mypage-posts', 'notices'] as const,
};

export const useMyRecruitments = () =>
  useQuery({
    queryKey: mypagePostKeys.recruitments(),
    queryFn: () => getMyRecruitments(),
  });

export const useMyApplications = () =>
  useQuery({
    queryKey: mypagePostKeys.applications(),
    queryFn: () => getMyApplications(),
  });

export const useMyTeamNotices = () =>
  useQuery({
    queryKey: mypagePostKeys.notices(),
    queryFn: () => getMyTeamNotices(),
  });

export const useCancelApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => cancelApplication(applicationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myApplications'],
      });
    },
  });
};
