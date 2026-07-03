import axiosInstance from '@/lib/axiosInstance';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  MyInfoResponse,
  VerifySchoolRequest,
  VerifySchoolResponse,
} from '@/types/auth';

/** POST /auth/signup */
export const signup = (body: SignupRequest): Promise<SignupResponse> =>
  axiosInstance.post('/auth/signup', body).then((res) => res.data);

/** POST /auth/login */
export const login = (body: LoginRequest): Promise<LoginResponse> =>
  axiosInstance.post('/auth/login', body).then((res) => res.data);

export const getMyInfo = (): Promise<MyInfoResponse> =>
  axiosInstance.get('/users/me').then((res) => res.data);
/** POST /auth/verify-school */
export const verifySchool = (
  body: VerifySchoolRequest
): Promise<VerifySchoolResponse> =>
  axiosInstance.post('/auth/verify-school', body).then((res) => res.data);
