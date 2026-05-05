import Link from 'next/link';

export default function Notice() {
  return (
    <main className="min-h-screen p-6">
      {/* 헤더 */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 페이지</h1>
      </header>

      {/* 리스트 */}
      <section className="flex flex-col gap-3">
        {/* item */}
        <Link href="/notice/1">
          <div className="rounded-xl border bg-white p-4 transition hover:bg-gray-50">
            <h2 className="font-semibold">제목 1</h2>
            <p className="text-sm text-gray-500">만들겁니다</p>
          </div>
        </Link>

        <Link href="/notice/2">
          <div className="rounded-xl border bg-white p-4 transition hover:bg-gray-50">
            <h2 className="font-semibold">제목 2</h2>
            <p className="text-sm text-gray-500">두번째 공지</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
