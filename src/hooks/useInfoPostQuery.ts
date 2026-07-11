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
  updateInfoPost,
  uploadInfoPostImage,
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
    staleTime: 30 * 1000,
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
        presignedUrls.map((presignedUrl, index) =>
          uploadInfoPostImage(presignedUrl.uploadUrl, files[index])
        )
      );

      return presignedUrls.map((presignedUrl) => presignedUrl.imageKey);
    },
  });
