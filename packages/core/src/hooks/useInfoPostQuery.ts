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
  getInfoPostImagePresignedUrls,
  getInfoPosts,
  getMyInfoPosts,
  getRecruitmentsByInfoPost,
  updateInfoPost,
  uploadInfoPostImage,
} from '@moimi/core/api/infoPost';

import type {
  GetInfoPostsParams,
  InfoPostCreateRequest,
  InfoPostUpdateRequest,
  PageableParams,
} from '@moimi/core/types/infoPost';

export const infoPostKeys = {
  all: ['infoPosts'] as const,

  lists: () => [...infoPostKeys.all, 'list'] as const,
  list: (params: GetInfoPostsParams) =>
    [...infoPostKeys.lists(), params] as const,

  mineRoot: () => [...infoPostKeys.all, 'me'] as const,
  mine: (params: PageableParams) =>
    [...infoPostKeys.mineRoot(), params] as const,

  details: () => [...infoPostKeys.all, 'detail'] as const,
  detail: (infoPostId: number) =>
    [...infoPostKeys.details(), infoPostId] as const,

  recruitments: (infoPostId: number, params: PageableParams) =>
    [...infoPostKeys.detail(infoPostId), 'recruitments', params] as const,
};

// NOTE: 두 번째 인자로 { enabled } 를 받도록 확장했습니다.
// RecruitmentForm의 "내 스크랩만 보기" 필터가 켜졌을 때 이 목록 조회를
// 건너뛰기 위한 용도입니다. 기존 호출부(useInfoPosts(params))는
// enabled 기본값이 true이므로 그대로 동작합니다.
export const useInfoPosts = (
  params: GetInfoPostsParams = {},
  options: { enabled?: boolean } = {}
) =>
  useQuery({
    queryKey: infoPostKeys.list(params),
    queryFn: () => getInfoPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: false,
    enabled: options.enabled ?? true,
  });

export const useMyInfoPosts = (params: PageableParams = {}) =>
  useQuery({
    queryKey: infoPostKeys.mine(params),
    queryFn: () => getMyInfoPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: false,
  });

export const useInfoPostDetail = (infoPostId: number) =>
  useQuery({
    queryKey: infoPostKeys.detail(infoPostId),
    queryFn: () => getInfoPostDetail(infoPostId),
    enabled: Number.isFinite(infoPostId) && infoPostId > 0,
    retry: false,
  });

export const useRecruitmentsByInfoPost = (
  infoPostId: number,
  params: PageableParams = {}
) =>
  useQuery({
    queryKey: infoPostKeys.recruitments(infoPostId, params),
    queryFn: () => getRecruitmentsByInfoPost(infoPostId, params),
    enabled: Number.isFinite(infoPostId) && infoPostId > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useCreateInfoPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InfoPostCreateRequest) => createInfoPost(body),

    onSuccess: (createdInfoPost) => {
      queryClient.setQueryData(
        infoPostKeys.detail(createdInfoPost.infoPostId),
        createdInfoPost
      );

      void queryClient.invalidateQueries({
        queryKey: infoPostKeys.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: infoPostKeys.mineRoot(),
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

    onSuccess: (updatedInfoPost) => {
      queryClient.setQueryData(
        infoPostKeys.detail(updatedInfoPost.infoPostId),
        updatedInfoPost
      );

      queryClient.invalidateQueries({
        queryKey: infoPostKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: infoPostKeys.mineRoot(),
      });
    },
  });
};

export const useDeleteInfoPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (infoPostId: number) => deleteInfoPost(infoPostId),

    onSuccess: (_, infoPostId) => {
      queryClient.removeQueries({
        queryKey: infoPostKeys.detail(infoPostId),
      });

      queryClient.invalidateQueries({
        queryKey: infoPostKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: infoPostKeys.mineRoot(),
      });
    },
  });
};

export const useUploadInfoPostImages = () =>
  useMutation({
    mutationFn: async (files: File[]): Promise<string[]> => {
      if (files.length === 0) {
        return [];
      }

      const presignedUrls = await getInfoPostImagePresignedUrls(
        files.map((file) => ({
          fileName: file.name,
          contentType: file.type,
        }))
      );

      if (presignedUrls.length !== files.length) {
        throw new Error('이미지 업로드 URL 개수가 일치하지 않습니다.');
      }

      await Promise.all(
        presignedUrls.map((presignedUrl, index) => {
          const file = files[index];

          if (!file) {
            throw new Error('업로드할 이미지 파일을 찾을 수 없습니다.');
          }

          return uploadInfoPostImage(presignedUrl.uploadUrl, file);
        })
      );

      return presignedUrls.map(({ imageKey }) => imageKey);
    },
  });
