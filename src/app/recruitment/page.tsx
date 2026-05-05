export default function Recruitment() {
  return (
    <main className="min-h-screen p-6">
      {/* 헤더 */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">모집 게시판 페이지</h1>
      </header>

      {/* 리스트 */}
      <section className="flex flex-col gap-3">
        {/* item */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">제목</h2>
          <p className="text-sm text-gray-500">만들겁니다</p>
        </div>
      </section>
    </main>
  );
}
