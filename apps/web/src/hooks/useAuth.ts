'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth';
import type { AuthContextValue } from '@moimi/core/types/auth';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
