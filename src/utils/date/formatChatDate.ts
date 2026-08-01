// 채팅방 메시지 리스트에 날짜가 바뀔 때 표시하는 구분선 텍스트
export function formatChatDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

// 두 시각이 같은 날짜인지 비교 (연/월/일까지만 비교, 시간은 무시)
export function isSameDay(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

// 두 시각이 같은 분(分)인지 비교 — 연/월/일/시/분까지 비교, 초는 무시
// 채팅방에서 같은 사람이 연속으로 보낸 메시지의 시간 표시를 마지막 것만 남길 때 사용
export function isSameMinute(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    isSameDay(a, b) &&
    dateA.getHours() === dateB.getHours() &&
    dateA.getMinutes() === dateB.getMinutes()
  );
}
