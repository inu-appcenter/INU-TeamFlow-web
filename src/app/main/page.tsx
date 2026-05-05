'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import Card from '@/components/main/Card';

import { ChevronRight } from 'lucide-react';
import { FaBell } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function Main() {
  const router = useRouter();
  return (
    <main className="min-h-screen p-6">
      <section className="relative mb-10 pt-4 md:min-h-[160px]">
        {/* 로고 (하나만 존재) */}
        <div className="h-12 w-40 rounded-full bg-white" />

        {/* PC 배너만 */}
        <div className="absolute top-4 left-1/2 hidden h-36 w-[50%] max-w-3xl -translate-x-1/2 rounded-2xl bg-white md:block" />

        {/* 알림 */}
        <button className="fixed top-10 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-[0.5] border-[#D6DDE5] bg-white">
          <FaBell size={18} />
        </button>
      </section>

      <section className="mb-30 grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* 캘린더 */}
        <div className="md:col-span-7">
          <Card className="h-[420px] p-6">
            <h2 className="text-xl font-bold text-[#2C2C2C]">5월</h2>
          </Card>
        </div>

        {/* 공지사항 */}
        <div className="md:col-span-5">
          <Card className="h-[420px] p-6">
            <div className="flex items-center justify-between border-b-[0.5] border-[#D6DDE5] pb-2">
              <h2 className="text-xl font-bold text-[#2C2C2C]">공지사항</h2>
              <button
                onClick={() => router.push('/notice')}
                className="cursor-pointer text-[#2c2c2c] transition hover:text-[#2c2c2c]/80"
              >
                <ChevronRight />
              </button>
            </div>
          </Card>
        </div>

        {/* 모집 게시판 */}
        <div className="md:col-span-6">
          <Card className="h-[350px] p-6">
            <div className="flex items-center justify-between border-b-[0.5] border-[#d6dde5] pb-2">
              <h2 className="text-xl font-bold text-[#2C2C2C]">모집 게시판</h2>
              <button
                onClick={() => router.push('/recruitment')}
                className="cursor-pointer text-[#2c2c2c] transition hover:text-[#2c2c2c]/80"
              >
                <ChevronRight />
              </button>
            </div>
          </Card>
        </div>

        {/* 정보 게시판 */}
        <div className="md:col-span-6">
          <Card className="h-[350px] p-6">
            <div className="flex items-center justify-between border-b-[0.5] border-[#d6dde5] pb-2">
              <h2 className="text-xl font-bold text-[#2C2C2C]">정보 게시판</h2>
              <button className="cursor-pointer text-[#2c2c2c] transition hover:text-[#2c2c2c]/80">
                <ChevronRight />
              </button>
            </div>
          </Card>
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
