import axios from 'axios';

import { getApiClient } from './client';
import type {
  ProfilePresignedUrlRequest,
  ProfilePresignedUrlResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
  UserMeResponse,
  UserSearchResponse,
} from '@moimi/core/types/user';

/** GET /users/me */
export const getMyProfile = (): Promise<UserMeResponse> =>
  getApiClient().get('/users/me').then((res) => res.data);

/** PUT /users/me */
export const updateMyProfile = (
  body: UpdateMyProfileRequest
): Promise<UpdateMyProfileResponse> =>
  getApiClient().put('/users/me', body).then((res) => res.data);

/** POST /users/me/profile/presigned-url */
export const createProfilePresignedUrl = (
  body: ProfilePresignedUrlRequest
): Promise<ProfilePresignedUrlResponse> =>
  getApiClient()
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
  const { data } = await getApiClient().get<UserSearchResponse[]>('/users', {
    params: { name },
  });
  return data;
};

/** DELETE /users/me */
export const deleteUser = (): Promise<void> =>
  getApiClient().delete('/users/me').then(() => undefined);
