import axios from 'axios';

import axiosInstance from '@/lib/axiosInstance';
import type {
  ProfilePresignedUrlRequest,
  ProfilePresignedUrlResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
  UserMeResponse,
  UserSearchResponse,
} from '@/types/user';

/** GET /users/me */
export const getMyProfile = (): Promise<UserMeResponse> =>
  axiosInstance.get('/users/me').then((res) => res.data);

/** PUT /users/me */
export const updateMyProfile = (
  body: UpdateMyProfileRequest
): Promise<UpdateMyProfileResponse> =>
  axiosInstance.put('/users/me', body).then((res) => res.data);

/** POST /users/me/profile/presigned-url */
export const createProfilePresignedUrl = (
  body: ProfilePresignedUrlRequest
): Promise<ProfilePresignedUrlResponse> =>
  axiosInstance
    .post('/users/me/profile/presigned-url', body)
    .then((res) => res.data);

export const uploadProfileImage = (uploadUrl: string, file: File) =>
  axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

export const searchUsers = async (
  name: string
): Promise<UserSearchResponse[]> => {
  const { data } = await axiosInstance.get<UserSearchResponse[]>('/users', {
    params: { name },
  });
  return data;
};
