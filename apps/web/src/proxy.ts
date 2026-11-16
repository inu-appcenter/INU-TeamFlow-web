import { NextResponse, type NextRequest } from 'next/server';

const MOBILE_UA = /iPhone|iPod|Android.*Mobile|Windows Phone/i;
const NOTICE_PATH = '/mobile-notice';

// 폰에서도 열려야 하는 페이지 (앱에서 약관 링크로 들어옴)
const MOBILE_ALLOWED_PREFIXES = ['/policy'];

const isMobileAllowedPath = (pathname: string) =>
  MOBILE_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export function proxy(req: NextRequest) {
  // NEXT_PUBLIC_BLOCK_MOBILE=true인 배포(Production, Preview)에서 폰 접속 차단
  if (process.env.NEXT_PUBLIC_BLOCK_MOBILE !== 'true') {
    return NextResponse.next();
  }

  const isMobile = MOBILE_UA.test(req.headers.get('user-agent') ?? '');
  const { pathname, searchParams } = req.nextUrl;
  const isNoticePage = pathname === NOTICE_PATH;

  // 폰이면 안내 페이지로 (약관 등 허용 경로는 제외)
  if (isMobile && !isNoticePage && !isMobileAllowedPath(pathname)) {
    return NextResponse.redirect(new URL(NOTICE_PATH, req.url));
  }

  // PC·태블릿이 안내 페이지로 오면 메인으로 (?preview 붙이면 미리보기 가능)
  if (!isMobile && isNoticePage && !searchParams.has('preview')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일, 이미지, 폰트, 서비스워커 등은 제외
    '/((?!_next/static|_next/image|api|images|fonts|favicon.ico|firebase-messaging-sw.js|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$).*)',
  ],
};
