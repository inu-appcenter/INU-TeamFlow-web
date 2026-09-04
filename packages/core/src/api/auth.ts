import { getApiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  MyInfoResponse,
  VerifySchoolRequest,
  VerifySchoolResponse,
} from '@moimi/core/types/auth';

/** POST /auth/signup */
export const signup = (body: SignupRequest): Promise<SignupResponse> =>
  getApiClient().post('/auth/signup', body).then((res) => res.data);

/** POST /auth/login */
export const login = (body: LoginRequest): Promise<LoginResponse> =>
  getApiClient().post('/auth/login', body).then((res) => res.data);

export const getMyInfo = (): Promise<MyInfoResponse> =>
  getApiClient().get('/users/me').then((res) => res.data);
/** POST /auth/verify-school */
export const verifySchool = (
  body: VerifySchoolRequest
): Promise<VerifySchoolResponse> =>
  getApiClient().post('/auth/verify-school', body).then((res) => res.data);
