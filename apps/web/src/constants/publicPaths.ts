// 로그인 없이 접근 가능한 경로 (AuthGuard, axios 인터셉터 공용)
export const PUBLIC_PATHS = ["/login", "/register", "/policy"];

export function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
}
