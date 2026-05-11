'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import Card from '@/components/main/Card';
import NotificationButton from '@/components/common/notification/NotificationButton';

import { ChevronRight } from 'lucide-react';
import { FaBell } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { recruitments } from '@/mocks/recruitments';
import { notices } from '@/mocks/notices';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categories = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '동아리', value: 'CLUB' },
  { label: '기타', value: 'ETC' },
];

export default function Main() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const filteredRecruitments = recruitments

    .filter((recruitment) => {
      if (selectedCategory === 'ALL') return true;

      return recruitment.category === selectedCategory;
    })

    .slice(0, 3);

  const previewNotices = notices.slice(0, 4);

  return (
    <main className="min-h-screen p-6">
      <section className="relative mb-10 pt-4 md:min-h-[160px]">
        {/* 로고 (하나만 존재) */}
        <div className="h-12 w-40 rounded-full bg-white" />

        {/* PC 배너만 */}
        <div className="absolute top-4 left-1/2 hidden h-36 w-[50%] max-w-3xl -translate-x-1/2 rounded-2xl bg-white md:block" />

        {/* 알림 */}
        <NotificationButton />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 캘린더 */}
        <div className="lg:col-span-7">
          <Card className="h-[400px] p-6">
            <h2 className="text-xl font-bold text-[#2C2C2C]">5월</h2>
          </Card>
        </div>

        {/* 공지사항 */}
        <div className="lg:col-span-5">
          <Card className="h-[400px] p-6">
            <div className="flex items-center justify-between border-b-[0.5] border-[#D6DDE5] pb-2">
              <h2 className="text-xl font-bold text-[#2C2C2C]">공지사항</h2>
              <button
                onClick={() => router.push('/notice')}
                className="cursor-pointer text-[#2c2c2c] transition hover:text-[#2c2c2c]/80"
              >
                <ChevronRight />
              </button>
            </div>

            <div className="mt-1 flex flex-col">
              {previewNotices.map((notice) => (
                <button
                  key={notice.noticeId}
                  onClick={() => router.push(`/notice/${notice.noticeId}`)}
                  className="border-b-[0.5px] border-[#D6DDE5] py-4 text-left last:border-b-0"
                >
                  <h3 className="cursor-pointer truncate text-base font-semibold text-[#2C2C2C]">
                    [ {notice.teamName} ] {notice.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#989898]">
                    {notice.createdAt}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-30 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* 모집 게시판 */}
        <div className="xl:col-span-6">
          <Card className="h-[350px] overflow-hidden p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b-[0.5] border-[#d6dde5] pb-2">
              <h2 className="text-xl font-bold text-[#2C2C2C]">모집 게시판</h2>

              <button
                onClick={() => router.push('/recruitment')}
                className="cursor-pointer text-[#2c2c2c] transition hover:text-[#2c2c2c]/80"
              >
                <ChevronRight />
              </button>
            </div>

            {/* 카테고리 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`cursor-pointer rounded-2xl border-[0.5px] px-2.5 py-1 text-sm font-normal transition sm:px-3 sm:py-1.5 sm:text-base ${
                    selectedCategory === category.value
                      ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                      : 'border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* 리스트 */}
            <div className="mt-2 flex flex-col">
              {filteredRecruitments.map((recruitment) => (
                <button
                  key={recruitment.recruitmentId}
                  onClick={() =>
                    router.push(`/recruitment/${recruitment.recruitmentId}`)
                  }
                  className="border-b-[0.5px] border-[#D6DDE5] py-3.5 text-left last:border-b-0"
                >
                  <h3 className="truncate cursor-pointer text-base font-semibold text-[#2C2C2C]">
                    [ {categoryMap[recruitment.category]} ] {recruitment.title}
                  </h3>
                  <p
                    className={`mt-1 truncate text-xs ${
                      recruitment.announcementTitle
                        ? 'text-[#2C2C2C]'
                        : 'text-[#B0B0B0]'
                    }`}
                  >
                    {recruitment.announcementTitle ||
                      '연결된 정보글이 없습니다'}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* 정보 게시판 */}
        <div className="xl:col-span-6">
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
