import { createPushToken, deletePushToken } from '@moimi/core/api/pushToken';
import type { FcmTokenRequest, FcmTokenResponse } from '@moimi/core/types/fcm';

export const createFcmToken = (
  body: FcmTokenRequest
): Promise<FcmTokenResponse> => createPushToken({ ...body, provider: 'FCM' });

export const deleteFcmToken = (body: FcmTokenRequest): Promise<void> =>
  deletePushToken({ ...body, provider: 'FCM' });
