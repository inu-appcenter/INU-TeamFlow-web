'use client';

import { AuthContext } from '@/contexts/auth';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { AuthProviderProps } from '@moimi/core/types/auth';
import FcmPermissionNotice from '@/components/common/notification/FcmPermissionNotice';

export function AuthProvider({ children }: AuthProviderProps) {
  const { contextValue, notifications } = useAuthSession();
  const {
    notice,
    noticePending,
    noticeError,
    clearNotice,
    allowNotifications,
  } = notifications;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {contextValue.user && notice && (
        <FcmPermissionNotice
          permission={notice}
          isPending={noticePending}
          error={noticeError}
          onAllow={() => {
            void allowNotifications();
          }}
          onClose={clearNotice}
        />
      )}
    </AuthContext.Provider>
  );
}
