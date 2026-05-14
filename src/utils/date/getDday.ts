export const getDday = (target: Date | string) => {
  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const targetDateObj = new Date(target);

  const targetDate = new Date(
    targetDateObj.getFullYear(),
    targetDateObj.getMonth(),
    targetDateObj.getDate()
  );

  const diff = Math.ceil(
    (targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return '오늘';
  if (diff > 0) return `D - ${diff}`;

  return `D + ${Math.abs(diff)}`;
};
