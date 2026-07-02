import { useQuery } from '@tanstack/react-query';

import {
  getMyApplications,
  getMyRecruitments,
  getMyTeamNotices,
} from '@/api/mypagePost';

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