'use client';

import { createContext } from 'react';
import type { AuthContextValue } from '@moimi/core/types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
