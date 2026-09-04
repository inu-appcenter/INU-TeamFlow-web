import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyInfoPostScraps, getMyRecruitmentScraps } from '@moimi/core/api/scrap';

export const scrapKeys = {
  all: () => ['scraps'] as const,
  recruitments: () => [...scrapKeys.all(), 'recruitments'] as const,
  infoPosts: () => [...scrapKeys.all(), 'infoPosts'] as const,
};

export const useRecruitmentScraps = (size = 10, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...scrapKeys.recruitments(), size],
    queryFn: ({ pageParam }) => getMyRecruitmentScraps(pageParam, size),
    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },

    enabled,

    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useInfoPostScraps = (size = 10, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...scrapKeys.infoPosts(), size],

    queryFn: ({ pageParam }) => getMyInfoPostScraps(pageParam, size),

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },

    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
