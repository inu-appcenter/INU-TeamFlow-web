import Card from '@/components/main/Card';

export default function ApplicationDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div className="h-16 bg-[#E9E9E9] sm:h-18" />

          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <div className="h-6 w-16 animate-pulse rounded-xl bg-[#E5E8EC] sm:h-7 sm:w-15" />

            <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-[#E5E8EC] sm:h-7" />

            <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 sm:grid-cols-[90px_1fr] sm:gap-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="contents">
                  <div className="h-4 w-10 animate-pulse rounded bg-[#E5E8EC]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[#E5E8EC]" />
                </div>
              ))}
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5]" />

            <div className="mt-7 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#E5E8EC]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#E5E8EC]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E5E8EC]" />
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5]" />
          </div>
        </Card>
      </section>
    </main>
  );
}
