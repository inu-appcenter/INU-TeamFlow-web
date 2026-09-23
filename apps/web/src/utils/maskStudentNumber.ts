export function maskStudentNumber(studentNumber?: string | null): string {
  if (!studentNumber) return '';

  const len = studentNumber.length;
  if (len < 7) return studentNumber;

  const start = 4;
  return (
    studentNumber.slice(0, start) +
    '*'.repeat(3) +
    studentNumber.slice(start + 3)
  );
}
