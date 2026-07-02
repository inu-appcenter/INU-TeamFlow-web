import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, signup, verifySchool } from '@/api/auth';
import { userKeys } from '@/hooks/useUserQuery';
import type {
  LoginRequest,
  SignupRequest,
  VerifySchoolRequest,
} from '@/types/auth';

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

export const useVerifySchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VerifySchoolRequest) => verifySchool(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.me(),
      });
    },
  });
};