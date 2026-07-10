import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createInfoPost,
  deleteInfoPost,
  getInfoPostDetail,
  getInfoPosts,
  updateInfoPost,
} from '@/api/infoPost';

import type {
  GetInfoPostsParams,
  InfoPostCreateRequest,
  InfoPostUpdateRequest,
} from '@/types/infoPost';

export const infoPostKeys = {
  all: () => ['infoPosts'] as const,
  detail: (id: number) => ['infoPosts', id] as const,
};

export const useInfoPosts = (params: GetInfoPostsParams = {}) =>
  useQuery({
    queryKey: [...infoPostKeys.all(), params],
    queryFn: () => getInfoPosts(params),
    placeholderData: keepPreviousData,
  });

export const useInfoPostDetail = (infoPostId: number) =>
  useQuery({
    queryKey: infoPostKeys.detail(infoPostId),
    queryFn: () => getInfoPostDetail(infoPostId),
    enabled: Number.isFinite(infoPostId) && infoPostId > 0,
  });

export const useCreateInfoPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InfoPostCreateRequest) => createInfoPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infoPostKeys.all(),
      });
    },
  });
};

export const useUpdateInfoPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      infoPostId,
      body,
    }: {
      infoPostId: number;
      body: InfoPostUpdateRequest;
    }) => updateInfoPost(infoPostId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: infoPostKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: infoPostKeys.detail(variables.infoPostId),
      });
    },
  });
};

export const useDeleteInfoPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (infoPostId: number) => deleteInfoPost(infoPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infoPostKeys.all(),
      });
    },
  });
};
