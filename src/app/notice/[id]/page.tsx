export default function NoticeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">공지사항 상세</h1>

      <div className="mt-4 text-gray-500">공지 ID: {params.id}</div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">제목 예시</h2>
        <p className="mt-2 text-gray-700">여기에 공지 내용이 들어갑니다.</p>
      </div>
    </main>
  );
}
