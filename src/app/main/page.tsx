'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import { BannerCarousel } from '@/components/main/banner/Banner';
import { useMyTeamNotices } from '@/hooks/useNoticeQuery';
import { useRecruitments } from '@/hooks/useRecruitmentQuery';
import { cafe24Nyangi, circulat } from '@/fonts/logoFonts';
import { useInfoPosts } from '@/hooks/useInfoPostQuery';
import InfoPostListItem from '@/components/main/infoPost/InfoPostListItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { darkenColor } from '@/utils/color/darkenColor';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useCalendarGrid } from '@/hooks/calendar/useCalendarGrid';
import { useMonthSchedules } from '@/hooks/calendar/useMonthSchedules';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import NoticeListItem from '@/components/main/notice/NoticeListItem';
import RecruitmentListItem from '@/components/main/recruitment/RecruitmentListItem';
import MonthCalendar from '@/components/main/calendar/MonthCalendar';
import DaySchedulePanel from '@/components/main/calendar/DaySchedulePanel';
import { categoryFilterOptions } from '@/constants/category';
import { infoPostCategoryFilterOptions } from '@/constants/infoPost';
import type { InfoPostCategory } from '@/types/infoPost';

export default function Main() {
  type InfoPostCategoryValue = 'ALL' | InfoPostCategory;
  const router = useRouter();
  const today = new Date();
  const [selectedInfoPostCategory, setSelectedInfoPostCategory] =
    useState<InfoPostCategoryValue>('ALL');

  const infoPostCategoryScrollRef = useRef<HTMLDivElement>(null);

  const infoPostCategoryButtonRefs = useRef<
    Partial<Record<InfoPostCategoryValue, HTMLButtonElement | null>>
  >({});
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

  const handleInfoPostCategoryChange = (category: InfoPostCategoryValue) => {
    setSelectedInfoPostCategory(category);

    requestAnimationFrame(() => {
      infoPostCategoryButtonRefs.current[category]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    });
  };

  const filteredRecruitments = recruitments.filter((recruitment) => {
    if (selectedCategory === 'ALL') return true;

    return recruitment.category === selectedCategory;
  });

  const mobileRecruitments = filteredRecruitments.slice(0, 4);
  const desktopRecruitments = filteredRecruitments.slice(0, 3);

  const { data: infoPostData, isLoading: isInfoPostsLoading } = useInfoPosts({
    category:
      selectedInfoPostCategory === 'ALL' ? undefined : selectedInfoPostCategory,
    page: 0,
    size: 4,
    sort: ['createdAt,DESC'],
  });

  const infoPosts = infoPostData?.content ?? [];

  const mobileInfoPosts = infoPosts.slice(0, 4);
  const desktopInfoPosts = infoPosts.slice(0, 3);

  const { data: myNotices = [] } = useMyTeamNotices();

  const sortedNotices = [...myNotices].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  const mobileNotices = sortedNotices.slice(0, 5);
  const desktopNotices = sortedNotices.slice(0, 4);

  useEffect(() => {
    const container = infoPostCategoryScrollRef.current;

    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      container.scrollLeft += delta;
    };

    container.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const logoM = [{ label: 'Circulat', className: circulat.className }];

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* 상단 */}
        <section className="relative mb-8 pt-4 md:min-h-[160px]">
          <div className="fixed top-4 left-10 z-80 flex flex-col items-center">
            {logoM.map((font) => (
              <motion.span
                key={font.label}
                className={`${font.className} inline-flex text-[45px]`}
                style={{ color: '#5E92F0' }}
              >
                {'Moimi'.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: [0, -10, 0],
                    }}
                    transition={{
                      opacity: {
                        duration: 0.4,
                        delay: index * 0.09,
                        ease: 'easeOut',
                      },
                      y: {
                        duration: 0.75,
                        ease: 'easeInOut',
                        delay: index * 0.11,
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            ))}
          </div>

          {/* 배너: 가로 길이 확장 */}
          <div className="absolute top-4 left-1/2 hidden h-40 w-[60%] max-w-4xl -translate-x-1/2 rounded-3xl md:block">
            <BannerCarousel />
          </div>

          <NotificationButton />
        </section>

        {/* 캘린더 + 공지사항 */}
        <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* 캘린더 */}
          <div className="lg:col-span-7">
            <Card className="h-[400px] overflow-hidden px-4 pt-6 lg:p-6">
              <div className="mx-2 mb-3 flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2 lg:mx-0">
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

              <div className="grid h-[315px] grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr] lg:h-[305px]">
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
        <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
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

              <div className="relative mt-3 hidden border-b-[0.5px] border-[#D6DDE5] sm:flex">
                {categoryFilterOptions.map((category) => {
                  const isActive = selectedCategory === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setSelectedCategory(category.value)}
                      className={`relative z-50 flex-1 cursor-pointer pb-3 text-center text-[17px] font-semibold whitespace-nowrap transition ${
                        isActive
                          ? 'text-[#5E92F0]'
                          : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                      }`}
                    >
                      {category.label}
                      {isActive && (
                        <motion.div
                          layoutId="mainRecruitmentCategoryIndicator"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                          transition={{
                            type: 'spring',
                            stiffness: 600,
                            damping: 50,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
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

              <div className="hidden flex-col sm:flex">
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
                <div>
                  <h2 className="text-xl font-bold text-[#2C2C2C]">
                    정보 게시판
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/infoPost')}
                  aria-label="정보 게시판으로 이동"
                  className="z-50 flex cursor-pointer items-center justify-center text-[#2C2C2C] transition-all duration-150 hover:text-[#2C2C2C]/80 active:scale-90"
                >
                  <ChevronRight />
                </button>
              </div>

              {/* 카테고리 */}
              <div className="relative mt-3 hidden border-b-[0.5px] border-[#D6DDE5] sm:flex">
                {infoPostCategoryFilterOptions.slice(0, 6).map((category) => {
                  const isActive = selectedInfoPostCategory === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        setSelectedInfoPostCategory(category.value)
                      }
                      className={`relative z-50 flex-1 cursor-pointer pb-3 text-center text-[17px] font-semibold whitespace-nowrap transition ${
                        isActive
                          ? 'text-[#5E92F0]'
                          : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                      }`}
                    >
                      {category.label}
                      {isActive && (
                        <motion.div
                          layoutId="mainInfoPostCategoryIndicator"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                          transition={{
                            type: 'spring',
                            stiffness: 600,
                            damping: 50,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 모바일 리스트 */}
              <div className="mt-0 flex flex-col sm:hidden">
                {isInfoPostsLoading ? (
                  <div className="flex h-[220px] items-center justify-center text-sm font-medium text-[#989898]">
                    정보글을 불러오는 중입니다
                  </div>
                ) : mobileInfoPosts.length > 0 ? (
                  mobileInfoPosts.map((infoPost) => (
                    <InfoPostListItem
                      key={infoPost.infoPostId}
                      infoPost={infoPost}
                      size="sm"
                    />
                  ))
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm font-medium text-[#989898]">
                    등록된 정보글이 없습니다
                  </div>
                )}
              </div>

              {/* 데스크톱 리스트 */}
              <div className="hidden flex-col sm:flex">
                {isInfoPostsLoading ? (
                  <div className="flex h-[190px] items-center justify-center text-sm font-medium text-[#989898]">
                    정보글을 불러오는 중입니다
                  </div>
                ) : desktopInfoPosts.length > 0 ? (
                  desktopInfoPosts.map((infoPost) => (
                    <InfoPostListItem
                      key={infoPost.infoPostId}
                      infoPost={infoPost}
                      size="lg"
                    />
                  ))
                ) : (
                  <div className="flex h-[190px] items-center justify-center text-sm font-medium text-[#989898]">
                    등록된 정보글이 없습니다
                  </div>
                )}
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
