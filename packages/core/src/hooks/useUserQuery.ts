import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createProfilePresignedUrl,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from '@moimi/core/api/user';
import type {
  ProfilePresignedUrlRequest,
  UpdateMyProfileRequest,
} from '@moimi/core/types/user';

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

export const useDeleteUser = () =>
  useMutation({
    mutationFn: deleteUser,
  });
