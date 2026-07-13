export default function TeamDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl rounded-b-none bg-white">
          {/* 상단 컬러 헤더 */}
          <div className="h-[72px] animate-pulse bg-[#E5E9EF]" />

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {/* 팀 기본 정보 */}
            <section className="grid grid-cols-[140px_1fr] gap-6 sm:grid-cols-[150px_1fr_200px] md:grid-cols-[150px_1fr_300px]">
              <div className="h-[140px] w-[140px] animate-pulse rounded-2xl bg-[#E5E9EF] sm:h-[150px] sm:w-[150px]" />

              <div className="flex flex-col justify-center gap-3">
                <div className="h-7 w-2/3 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-[#E5E9EF]" />
              </div>

              <div className="hidden sm:block">
                <div className="h-[150px] w-[200px] animate-pulse rounded-2xl bg-[#E5E9EF] md:w-[300px]" />
              </div>
            </section>

            {/* 캘린더 영역 */}
            <section className="mt-4 h-[400px] animate-pulse rounded-2xl bg-[#F8F9FB] md:mt-6" />

            {/* 투표 / 공지 영역 */}
            <section className="gap-6 md:flex md:grid md:grid-cols-10">
              <div className="col-span-5 mt-4 h-[300px] animate-pulse rounded-2xl bg-[#F8F9FB] md:mt-6 md:h-[400px]" />
              <div className="col-span-5 mt-4 h-[300px] animate-pulse rounded-2xl bg-[#F8F9FB] md:mt-6 md:h-[400px]" />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
