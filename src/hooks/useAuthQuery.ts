import { useMutation } from '@tanstack/react-query';

import { signup } from '@/api/auth';
import type { SignupRequest } from '@/types/auth';

export const authKeys = {
  all: () => ['auth'] as const,
};

export const useSignup = () =>
  useMutation({
    mutationFn: (body: SignupRequest) => signup(body),
  });