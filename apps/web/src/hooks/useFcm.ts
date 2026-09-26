'use client';

import {
  syncFcmToken,
  unregisterFcmToken,
  requestFcmPermission,
} from '@/lib/fcmLifecycle';

export const useFcm = () => ({
  syncFcmToken,
  unregisterFcmToken,
  requestFcmPermission,
});
