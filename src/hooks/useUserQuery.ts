import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createProfilePresignedUrl,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from '@/api/user';
import type {
  ProfilePresignedUrlRequest,
  UpdateMyProfileRequest,
} from '@/types/user';

export const userKeys = {
  all: () => ['users'] as const,
  me: () => ['users', 'me'] as const,
};

export const useMyProfile = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: getMyProfile,
  });

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyProfileRequest) => updateMyProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.me(),
      });
    },
  });
};

export const useProfilePresignedUrl = () =>
  useMutation({
    mutationFn: (body: ProfilePresignedUrlRequest) =>
      createProfilePresignedUrl(body),
  });

export const useUploadProfileImage = () =>
  useMutation({
    mutationFn: ({ uploadUrl, file }: { uploadUrl: string; file: File }) =>
      uploadProfileImage(uploadUrl, file),
  });