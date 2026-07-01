import axiosInstance from '@/lib/axiosInstance';
import type { SignupRequest, SignupResponse } from '@/types/auth';

/** POST /auth/signup */
export const signup = (body: SignupRequest): Promise<SignupResponse> =>
  axiosInstance.post('/auth/signup', body).then((res) => res.data);
