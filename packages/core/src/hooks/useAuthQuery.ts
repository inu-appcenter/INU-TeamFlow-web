

import { useMutation, useQueryClient,useQuery } from '@tanstack/react-query';
import { login, signup, verifySchool,getMyInfo } from '@moimi/core/api/auth';
import { userKeys } from './useUserQuery';
import type {
  LoginRequest,
  SignupRequest,
  VerifySchoolRequest,
} from '@moimi/core/types/auth';


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
