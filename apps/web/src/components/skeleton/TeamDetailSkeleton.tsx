export default function TeamDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl rounded-b-none bg-white">
          {/* 상단 컬러 헤더 */}
          <div className="h-[72px] animate-pulse bg-[#E5E9EF]" />

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {/* 팀 기본 정보 */}
            <section className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex items-start justify-between">
                <div className="h-[150px] w-[150px] animate-pulse rounded-2xl bg-[#E5E9EF]" />

                {/* 모바일 메뉴 버튼 */}
                <div className="ml-auto h-10 w-10 shrink-0 animate-pulse self-start rounded-full bg-[#E5E9EF] sm:hidden" />
              </div>

              <div className="flex flex-col justify-center gap-3 px-1 sm:px-0">
                <div className="h-7 w-40 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-4 w-[280px] animate-pulse rounded bg-[#E5E9EF] sm:w-[300px] md:w-[400px]" />
                <div className="h-4 w-40 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[#E5E9EF]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[#E5E9EF]" />
              </div>

              {/* 데스크탑 메뉴 버튼 */}
              <div className="ml-auto hidden h-10 w-10 shrink-0 animate-pulse self-start rounded-full bg-[#E5E9EF] sm:block" />
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
