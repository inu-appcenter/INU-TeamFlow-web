// 알림 redirectUrl(web 경로)을 모바일에서 쌓을 화면 목록으로 변환
// 마지막 화면이 목적지, 앞의 화면들은 뒤로가기 했을 때 거쳐갈 화면

const FALLBACK_STACK = ["/notification"];

// web 경로와 모바일 경로가 다르거나, 뒤로가기 화면을 같이 쌓아야 하는 경우
const REWRITES: [RegExp, (match: RegExpMatchArray) => string[]][] = [
  // 팀 공지 상세: web /team/:teamId/notice/:noticeId
  // → 팀 공지 목록 → 공지 상세(/notice/:noticeId?teamId=:teamId, 목록과 같은 방식)
  [
    /^\/team\/(\d+)\/notice\/(\d+)$/,
    (m) => [`/team/${m[1]}/notice`, `/notice/${m[2]}?teamId=${m[1]}`],
  ],
];

// 모바일에 실제로 있는 화면 (src/app 기준, 쿼리 제외)
const SUPPORTED: RegExp[] = [
  /^\/$/,
  /^\/(calendar|chat|explore|team|mypage|notification)$/,
  /^\/chat\/\d+$/,
  /^\/team\/\d+$/,
  /^\/team\/\d+\/notice$/,
  /^\/team\/\d+\/vote(\/\d+)?$/,
  /^\/notice(\/\d+)?$/,
  /^\/recruitment(\/\d+)?$/,
  /^\/recruitment\/\d+\/apply\/applications(\/\d+)?$/,
  /^\/application\/\d+$/,
  /^\/infoPost(\/\d+)?$/,
  /^\/mypage\/(authentication|inquiry|invitations|mypost|scraps|votes)$/,
];

const isSupported = (path: string) => {
  const pathname = path.split("?")[0];
  return SUPPORTED.some((pattern) => pattern.test(pathname));
};

export function resolveNotificationStack(redirectUrl: unknown): string[] {
  if (typeof redirectUrl !== "string" || !redirectUrl) return FALLBACK_STACK;

  // 전체 URL로 와도 경로만 사용, 서버가 보낸 쿼리/해시는 제외
  let path: string;
  try {
    path = new URL(redirectUrl, "https://moimi.local").pathname;
  } catch {
    return FALLBACK_STACK;
  }
  if (path.length > 1) path = path.replace(/\/+$/, "");

  let stack = [path];
  for (const [pattern, rewrite] of REWRITES) {
    const match = path.match(pattern);
    if (match) {
      stack = rewrite(match);
      break;
    }
  }

  return stack.every(isSupported) ? stack : FALLBACK_STACK;
}
