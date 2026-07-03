import { useMutation, useQuery } from '@tanstack/react-query';

import { login, signup, getMyInfo } from '@/api/auth';
import type { LoginRequest, SignupRequest } from '@/types/auth';

export const authKeys = {
  all: () => ['auth'] as const,
};

export const useSignup = () =>
  useMutation({
    mutationFn: (body: SignupRequest) => signup(body),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (body: LoginRequest) => login(body),
  });

export const useMyInfo = () => {
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
  });
};
