import { ChevronLeft } from 'lucide-react';

import Card from '@/components/main/Card';

interface NoticeDetailSkeletonProps {
  onBack: () => void;
}

export default function NoticeDetailSkeleton({
  onBack,
}: NoticeDetailSkeletonProps) {
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

          <div className="animate-pulse px-8 py-7 sm:px-8 sm:py-10">
            <div className="h-7 w-2/3 rounded-md bg-[#E9E9E9] sm:h-[26px]" />

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 shrink-0 rounded-full bg-[#E9E9E9]" />
                <div className="h-[14px] w-24 rounded bg-[#E9E9E9]" />
              </div>
              <div className="h-[14px] w-16 rounded bg-[#E9E9E9]" />
            </div>

            <div className="mt-4 border-b-[0.5px] border-[#D6DDE5]" />

            <div className="mt-4 flex flex-col gap-3">
              <div className="h-4 w-full rounded bg-[#E9E9E9]" />
              <div className="h-4 w-full rounded bg-[#E9E9E9]" />
              <div className="h-4 w-4/5 rounded bg-[#E9E9E9]" />
              <div className="h-4 w-full rounded bg-[#E9E9E9]" />
              <div className="h-4 w-3/5 rounded bg-[#E9E9E9]" />
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
