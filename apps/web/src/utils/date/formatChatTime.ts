// 채팅방 목록에 쓰는 마지막 메시지 시각 포맷
// 오늘이면 "오후 3:14", 올해면 "7월 13일", 그 외엔 "2025.07.13"
export const formatChatTime = (isoString: string | null): string => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isThisYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};
