// 채팅 상세(말풍선)에 쓰는 시각 포맷 — 항상 "오후 6:34" 형태
export function formatChatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
