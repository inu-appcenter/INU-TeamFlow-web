/**
 * 화면을 벗어나는 시점(탭 종료/백그라운드 전환/언마운트)에 읽음 위치를 최종 동기화하기 위한
 * keepalive fetch 헬퍼.
 *
 * markChatRead(axiosInstance.post)를 그대로 쓰지 않는 이유:
 * 일반 axios/fetch 요청은 페이지가 unload되는 순간 브라우저가 취소해버릴 수 있다.
 * navigator.sendBeacon은 이 문제를 해결해주지만 커스텀 헤더를 실을 수 없는데,
 * 이 프로젝트의 인증은 axiosInstance 인터셉터가 붙이는 `Authorization: Bearer <accessToken>`
 * 헤더 기반이라 sendBeacon으로는 인증이 깨진다.
 * -> fetch(..., { keepalive: true })로 헤더는 그대로 유지하면서, 페이지가 언로드된 뒤에도
 *    브라우저가 요청을 이어서 처리하도록 한다.
 */
export function markChatReadKeepalive(
  roomId: number,
  lastReadMessageId: number
): void {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('accessToken');
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;
  const url = `${baseUrl}/chat-rooms/${roomId}/read`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ lastReadMessageId }),
    keepalive: true,
  }).catch(() => {
    // 페이지를 벗어나는 시점이라 실패해도 별도로 재시도할 방법이 없어 조용히 무시한다.
    // (다음에 방에 다시 들어오면 markAsRead가 다시 정상 경로로 나간다)
  });
}
