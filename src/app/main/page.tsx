'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import { BannerCarousel } from '@/components/main/banner/Banner';
import { useMyTeamNotices } from '@/hooks/useNoticeQuery';
import { useRecruitments } from '@/hooks/useRecruitmentQuery';

import { useInfoPosts } from '@/hooks/useInfoPostQuery';
import InfoPostListItem from '@/components/main/infoPost/InfoPostListItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useCalendarGrid } from '@/hooks/useCalendarGrid';
import { useMonthSchedules } from '@/hooks/useMonthSchedules';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import NoticeListItem from '@/components/main/notice/NoticeListItem';
import RecruitmentListItem from '@/components/main/recruitment/RecruitmentListItem';
import MonthCalendar from '@/components/main/calendar/MonthCalendar';
import DaySchedulePanel from '@/components/main/calendar/DaySchedulePanel';
import {
  categoryMap,
  categoryColorMap,
  categoryFilterOptions,
} from '@/constants/category';

export default function Main() {
  const router = useRouter();
  const today = new Date();
  const [selectedInfoPostCategory, setSelectedInfoPostCategory] =
    useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [selectedDate, setSelectedDate] = useState(today);
  const selectedDateKey = formatDateKey(selectedDate);

  const schedules = useMonthSchedules(year, month);

  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );

  const { data: recruitmentData } = useRecruitments(0, 100);
  const recruitments = recruitmentData?.content ?? [];

  const calendarDates = useCalendarGrid(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const filteredRecruitments = recruitments.filter((recruitment) => {
    if (selectedCategory === 'ALL') return true;

    return recruitment.category === selectedCategory;
  });

  const mobileRecruitments = filteredRecruitments.slice(0, 4);
  const desktopRecruitments = filteredRecruitments.slice(0, 3);

  const { data: infoPostData } = useInfoPosts(0, 100);
  const infoPosts = infoPostData?.content ?? [];
  const filteredInfoPosts = infoPosts.filter((infoPost) => {
    if (selectedInfoPostCategory === 'ALL') return true;

    return infoPost.category === selectedInfoPostCategory;
  });
  const mobileInfoPosts = filteredInfoPosts.slice(0, 4);
  const desktopInfoPosts = filteredInfoPosts.slice(0, 3);

  const { data: myNotices = [] } = useMyTeamNotices();

  const sortedNotices = [...myNotices].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  const mobileNotices = sortedNotices.slice(0, 5);
  const desktopNotices = sortedNotices.slice(0, 4);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* 상단 */}
        <section className="relative mb-10 pt-4 md:min-h-[160px]">
          <div className="h-12 w-40 rounded-full bg-white"></div>
          <div className="absolute top-4 left-1/2 hidden h-40 w-[50%] max-w-3xl -translate-x-1/2 rounded-3xl md:block">
            <BannerCarousel />
          </div>
          <NotificationButton />
        </section>

        {/* 캘린더 + 공지사항 */}
        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 캘린더 */}
          <div className="lg:col-span-7">
            <Card className="h-[400px] overflow-hidden p-6">
              <div className="mb-3 flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  {month + 1}월
                </h2>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F6F8FA] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F6F8FA] text-[#2c2c2c]/40 transition-all duration-150 active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid h-[305px] grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <MonthCalendar
                  year={year}
                  month={month}
                  calendarDates={calendarDates}
                  schedules={schedules}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                <DaySchedulePanel
                  selectedDate={selectedDate}
                  selectedSchedules={selectedSchedules}
                />
              </div>
            </Card>
          </div>

          {/* 공지사항 */}
          <div className="lg:col-span-5">
            <Card className="h-[400px] p-6">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">공지사항</h2>

                <button
                  type="button"
                  onClick={() => router.push('/notice')}
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="mt-0 flex flex-col sm:hidden">
                {mobileNotices.map((notice) => (
                  <NoticeListItem
                    key={notice.noticeId}
                    notice={notice}
                    size="sm"
                  />
                ))}
              </div>

              <div className="mt-0 hidden flex-col sm:flex">
                {desktopNotices.map((notice) => (
                  <NoticeListItem
                    key={notice.noticeId}
                    notice={notice}
                    size="lg"
                  />
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 모집 게시판 + 정보 게시판 */}
        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* 모집 게시판 */}
          <div className="xl:col-span-6">
            <Card className="h-[345px] overflow-hidden p-6 sm:h-[350px]">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  모집 게시판
                </h2>

                <button
                  type="button"
                  onClick={() => router.push('/recruitment')}
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                {categoryFilterOptions.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`z-50 cursor-pointer rounded-2xl border-[0.5px] px-2.5 py-1 text-sm font-normal transition-all duration-150 active:scale-95 sm:px-3.5 sm:py-1.5 sm:text-base ${
                      selectedCategory === category.value
                        ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                        : 'border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C] hover:bg-[#E3E7EC]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-0 flex flex-col sm:hidden">
                {mobileRecruitments.map((recruitment) => (
                  <RecruitmentListItem
                    key={recruitment.recruitmentId}
                    recruitment={recruitment}
                    size="sm"
                  />
                ))}
              </div>

              <div className="mt-1 hidden flex-col sm:flex">
                {desktopRecruitments.map((recruitment) => (
                  <RecruitmentListItem
                    key={recruitment.recruitmentId}
                    recruitment={recruitment}
                    size="lg"
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* 정보 게시판 */}
          <div className="xl:col-span-6">
            <Card className="h-[345px] overflow-hidden p-6 sm:h-[350px]">
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
                <h2 className="text-xl font-bold text-[#2C2C2C]">
                  정보 게시판
                </h2>

                <button
                  type="button"
                  onClick={() => router.push('/infoPost')}
                  className="z-50 cursor-pointer text-[#2C2C2C] transition hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              {/* 카테고리 */}
              <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                {categoryFilterOptions.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedInfoPostCategory(category.value)}
                    className={`z-50 cursor-pointer rounded-2xl border-[0.5px] px-2.5 py-1 text-sm font-normal transition-all duration-150 active:scale-95 sm:px-3.5 sm:py-1.5 sm:text-base ${
                      selectedInfoPostCategory === category.value
                        ? 'border-[#D6DDE5] bg-[#5E92F0] text-white'
                        : 'border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C] hover:bg-[#E3E7EC]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* 리스트 */}
              <div className="mt-0 flex flex-col sm:hidden">
                {mobileInfoPosts.map((infoPost) => (
                  <InfoPostListItem
                    key={infoPost.infoPostId}
                    infoPost={infoPost}
                    size="sm"
                  />
                ))}
              </div>

              <div className="mt-1 hidden flex-col sm:flex">
                {desktopInfoPosts.map((infoPost) => (
                  <InfoPostListItem
                    key={infoPost.infoPostId}
                    infoPost={infoPost}
                    size="lg"
                  />
                ))}
              </div>
            </Card>
          </div>
        </section>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto mb-40 w-fit"
        >
          <Image
            src="/images/app-center-black.png"
            alt="App Center 로고"
            width={150}
            height={150}
            className="h-auto w-auto shrink-0 opacity-20"
          />
        </motion.div>
      </div>

      <BottomNav />
    </main>
  );
}
