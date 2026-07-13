import { ChevronLeft } from 'lucide-react';

import Card from '@/components/main/Card';

interface RecruitmentDetailSkeletonProps {
  onBack: () => void;
}

export default function RecruitmentDetailSkeleton({
  onBack,
}: RecruitmentDetailSkeletonProps) {
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div className="flex h-16 items-center justify-between bg-[#E9E9E9] px-6 sm:h-18">
            <button onClick={onBack} className="cursor-pointer text-[#2C2C2C]">
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="sm:h-7 sm:w-7"
              />
            </button>
          </div>

          <div className="animate-pulse px-8 py-7 sm:px-10 sm:py-10">
            <div className="h-7 w-3/4 rounded-md bg-[#E9E9E9] sm:h-8" />

            <div className="mt-3 h-7 w-40 rounded-xl bg-[#E9E9E9] sm:mt-4" />

            <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 sm:mt-8 sm:grid-cols-[90px_1fr] sm:gap-y-5">
              <div className="h-4 w-10 rounded bg-[#E9E9E9]" />
              <div className="h-4 w-16 rounded bg-[#E9E9E9]" />

              <div className="h-4 w-10 rounded bg-[#E9E9E9]" />
              <div className="h-6 w-16 rounded-xl bg-[#E9E9E9]" />

              <div className="h-4 w-10 rounded bg-[#E9E9E9]" />
              <div className="h-4 w-28 rounded bg-[#E9E9E9]" />

              <div className="h-4 w-10 rounded bg-[#E9E9E9]" />
              <div className="h-4 w-12 rounded bg-[#E9E9E9]" />

              <div className="h-4 w-10 rounded bg-[#E9E9E9]" />
              <div className="h-4 w-20 rounded bg-[#E9E9E9]" />
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5] sm:mt-8" />

            <section className="mt-5 sm:mt-6">
              <div className="h-[13px] w-16 rounded bg-[#E9E9E9] sm:h-[15px]" />

              <div className="mt-4 flex flex-col gap-3">
                <div className="h-4 w-full rounded bg-[#E9E9E9]" />
                <div className="h-4 w-full rounded bg-[#E9E9E9]" />
                <div className="h-4 w-4/5 rounded bg-[#E9E9E9]" />
                <div className="h-4 w-full rounded bg-[#E9E9E9]" />
                <div className="h-4 w-3/5 rounded bg-[#E9E9E9]" />
              </div>
            </section>

            <div className="mt-14 border-b-[0.5px] border-[#D6DDE5] sm:mt-20" />

            <div className="mt-6 mb-30 flex justify-center">
              <div className="h-9 w-24 rounded-xl bg-[#E9E9E9]" />
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
