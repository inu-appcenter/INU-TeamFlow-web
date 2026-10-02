// 날짜(YYYY-MM-DD)와 시간(HH:mm) 문자열을 합쳐서 ISO 형식 datetime 문자열로 조합
// 예: createDateTime('2026-07-28', '18:34') → '2026-07-28T18:34:00'
export const createDateTime = (date: string, time: string) => {
  return `${date}T${time}:00`;
};
