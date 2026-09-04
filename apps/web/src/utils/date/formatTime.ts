// ISO 문자열에서 "HH:mm" 부분만 문자열 슬라이싱으로 추출 (24시간제 그대로)
export const formatTime = (dateString: string) => {
  return dateString.slice(11, 16);
};
