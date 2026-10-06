import { NextResponse, type NextRequest } from 'next/server';

const MOBILE_UA = /iPhone|iPod|Android.*Mobile|Windows Phone/i;
const NOTICE_PATH = '/mobile-notice';

export function proxy(req: NextRequest) {
  // 운영 배포에서만 차단 (dev 도메인에서는 폰으로 테스트 가능하게)
  if (process.env.NEXT_PUBLIC_BLOCK_MOBILE !== 'true') {
    return NextResponse.next();
  }

  const isMobile = MOBILE_UA.test(req.headers.get('user-agent') ?? '');
  const { pathname, searchParams } = req.nextUrl;
  const isNoticePage = pathname === NOTICE_PATH;

  // 폰이면 어떤 경로든 안내 페이지로
  if (isMobile && !isNoticePage) {
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
