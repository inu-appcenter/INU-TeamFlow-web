import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { login, signup, verifySchool, getMyInfo } from "@moimi/core/api/auth";
import { userKeys } from "./useUserQuery";
import type {
  LoginRequest,
  SignupRequest,
  VerifySchoolRequest,
} from "@moimi/core/types/auth";

export const authKeys = {
  all: () => ["auth"] as const,
};

export const useSignup = () =>
  useMutation({
    mutationFn: (body: SignupRequest) => signup(body),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (body: LoginRequest) => login(body),
  });

export const useMyInfo = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false; // 인증 에러는 재시도 X
      return failureCount < 2;
    },
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
