import axiosInstance from '@/lib/axiosInstance';

import type { FcmTokenRequest, FcmTokenResponse } from '@/types/fcm';

export const createFcmToken = (
  body: FcmTokenRequest
): Promise<FcmTokenResponse> =>
  axiosInstance.post('/fcm', body).then((response) => response.data);

export const deleteFcmToken = (body: FcmTokenRequest): Promise<void> =>
  axiosInstance
    .delete('/fcm', {
      data: body,
    })
    .then(() => undefined);
