'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import {
  myRecruitments,
  type MyPostType,
  type MyRecruitment,
} from '@/mocks/myRecruitments';
import { myApplications, type MyApplication } from '@/mocks/myApplications';
import { formatDate } from '@/utils/date/formatDate';

type MyPost = MyRecruitment | MyApplication;

const tabs: { label: string; value: MyPostType }[] = [
  { label: '전체', value: 'ALL' },
  { label: '모집', value: 'RECRUIT' },
  { label: '정보', value: 'INFO' },
  { label: '신청', value: 'APPLY' },
  { label: '공지', value: 'NOTICE' },
];

const getCategoryLabel = (category: string) => {
  if (category === 'CONTEST') return '공모전';
  if (category === 'PROJECT') return '프로젝트';
  if (category === 'STUDY') return '스터디';
  if (category === 'CLUB') return '동아리';
  return category;
};

const getApplicationStatusLabel = (status: string) => {
  if (status === 'WAITING') return '대기';
  if (status === 'ACCEPTED') return '수락';
  if (status === 'REJECTED') return '거절';
  return status;
};



export default function MyPostPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MyPostType>('ALL');

  const myPosts: MyPost[] = [...myRecruitments, ...myApplications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPosts =
    activeTab === 'ALL'
      ? myPosts
      : myPosts.filter((post) => post.type === activeTab);

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center gap-3 px-1">
        <button
          onClick={() => router.push('/mypage')}
          className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        <h1 className="text-[26px] font-bold text-[#2C2C2C]">내가 작성한 글</h1>
      </header>

      <section className="mx-auto max-w-[1180px]">
        <section className="animate-modal-pop min-h-[600px] rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 transition-all duration-200 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#EDF1F5] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2 text-[15px] font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-2xl px-4 py-2 transition-all duration-150 active:scale-95 ${
                    activeTab === tab.value
                      ? 'bg-[#5E92F0] text-white shadow-sm'
                      : 'border border-[#D6DDE5] bg-white text-[#2C2C2C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="thin-scrollbar grid max-h-[500px] gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                내역이 없습니다.
              </div>
            ) : (
              filteredPosts.map((post) =>
                post.type === 'APPLY' ? (
                  <ApplicationCard
                    key={post.applicationId}
                    application={post}
                    onClick={() =>
                      router.push(`/applications/${post.applicationId}`)
                    }
                  />
                ) : (
                  <RecruitmentCard
                    key={post.recruitmentId}
                    recruitment={post}
                    onClick={() =>
                      router.push(`/recruitments/${post.recruitmentId}`)
                    }
                  />
                )
              )
            )}
          </div>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}

function RecruitmentCard({
  recruitment,
  onClick,
}: {
  recruitment: MyRecruitment;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="line-clamp-1 text-[19px] font-bold text-[#2C2C2C]">
            [ {getCategoryLabel(recruitment.category)} ] {recruitment.title}
          </h2>

          <span
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${
              recruitment.isOpened
                ? 'bg-[#A8ECB0] text-[#236B32]'
                : 'bg-[#FF7B8A] text-white'
            }`}
          >
            {recruitment.isOpened ? '모집중' : '모집마감'}
          </span>
        </div>

        <p className="text-[14px] text-[#5C5C5C]">
          작성자 {recruitment.recruiterName}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[13px] text-[#989898]">
        <span>{formatDate(recruitment.createdAt)}</span>
        <span>~</span>
        <span>{formatDate(recruitment.endAt)}</span>
      </div>
    </button>
  );
}

function ApplicationCard({
  application,
  onClick,
}: {
  application: MyApplication;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="line-clamp-1 text-[19px] font-bold text-[#2C2C2C]">
            [ {getCategoryLabel(application.recruitmentCategory)} ] 신청서
          </h2>

          <span className="shrink-0 rounded-full bg-[#EEF1F5] px-4 py-1.5 text-[12px] font-semibold text-[#5E92F0]">
            {getApplicationStatusLabel(application.applicationStatus)}
          </span>
        </div>

        <p className="text-[14px] text-[#5C5C5C]">
          모집자 {application.recruiterName}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[13px] text-[#989898]">
        <span>신청일 {formatDate(application.createdAt)}</span>
        <span>·</span>
        <span>
          응답일
          {application.respondedAt ? formatDate(application.respondedAt) : ''}
        </span>
      </div>
    </button>
  );
}
