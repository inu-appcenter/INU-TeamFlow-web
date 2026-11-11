import { getApiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  MyInfoResponse,
  VerifySchoolRequest,
  VerifySchoolResponse,
} from "@moimi/core/types/auth";

/** POST /auth/signup */
export const signup = (body: SignupRequest): Promise<SignupResponse> =>
  getApiClient()
    .post("/auth/signup", body)
    .then((res) => res.data);

/** POST /auth/login */
export const login = (body: LoginRequest): Promise<LoginResponse> =>
  getApiClient()
    .post("/auth/login", body)
    .then((res) => res.data);

/** POST /auth/logout — 서버 refresh token 폐기 + 쿠키 삭제 (web: 쿠키 자동, mobile: Cookie 헤더) */
export const logout = (): Promise<void> => getApiClient().revokeRefreshToken();

export const getMyInfo = (): Promise<MyInfoResponse> =>
  getApiClient()
    .get("/users/me")
    .then((res) => res.data);

/** POST /auth/verify-school */
export const verifySchool = (
  body: VerifySchoolRequest
): Promise<VerifySchoolResponse> =>
  getApiClient()
    .post("/auth/verify-school", body)
    .then((res) => res.data);
