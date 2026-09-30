import posthog from 'posthog-js';

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken || !host) {
  if (process.env.NODE_ENV === 'development') {
    const missingVariable = !projectToken
      ? 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'
      : 'NEXT_PUBLIC_POSTHOG_HOST';

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: '2026-01-30',
    capture_pageview: 'history_change',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
    loaded: (client) => {
      try {
        // 만료/삭제된 세션의 계정이 첫 페이지 조회에 붙지 않게 정리한다.
        // 익명 방문자는 ID를 유지한다.
        if (
          !localStorage.getItem('accessToken') &&
          client.get_property('$user_id') != null
        ) {
          client.reset();
        }
      } catch {}
    },
  });
}
