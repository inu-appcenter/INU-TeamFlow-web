'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { useMyInfoPosts } from '@/hooks/useInfoPostQuery';
import {
  useCancelApplication,
  useMyApplications,
  useMyRecruitments,
  useMyTeamNotices,
} from '@/hooks/useMypagePostQuery';
import type { InfoPostSummaryResponse } from '@/types/infoPost';
import type {
  MyApplicationResponse,
  MyPost,
  MyPostType,
  MyRecruitmentResponse,
  MyTeamNoticeResponse,
} from '@/types/mypagePost';
import { formatDate } from '@/utils/date/formatDate';

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
  if (category === 'ETC') return '기타';

  return category;
};

const getApplicationStatusLabel = (status: string) => {
  if (status === 'WAITING') return '대기중';
  if (status === 'ACCEPTED') return '수락됨';
  if (status === 'DECLINED' || status === 'REJECTED') return '거절됨';
  if (status === 'CANCELED') return '취소됨';

  return status;
};

export default function MyPostPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MyPostType>('ALL');

  const {
    data: recruitments = [],
    isLoading: isRecruitmentsLoading,
    isError: isRecruitmentsError,
  } = useMyRecruitments();

  const {
    data: infoPostsPage,
    isLoading: isInfoPostsLoading,
    isError: isInfoPostsError,
  } = useMyInfoPosts();

  const infoPosts = infoPostsPage?.content ?? [];

  const {
    data: applications = [],
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
  } = useMyApplications();

  const {
    data: notices = [],
    isLoading: isNoticesLoading,
    isError: isNoticesError,
  } = useMyTeamNotices();

  const datedPosts = [
    ...recruitments.map((recruitment) => ({
      ...recruitment,
      type: 'RECRUIT' as const,
    })),
    ...applications.map((application) => ({
      ...application,
      type: 'APPLY' as const,
    })),
    ...notices.map((notice) => ({
      ...notice,
      type: 'NOTICE' as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const infoPostItems = infoPosts.map((infoPost) => ({
    ...infoPost,
    type: 'INFO' as const,
  }));

  const {
    mutate: cancelApplication,
    variables: cancellingApplicationId,
    isPending: isCancelling,
  } = useCancelApplication();

  const myPosts: MyPost[] = [...datedPosts, ...infoPostItems];

  const filteredPosts =
    activeTab === 'ALL'
      ? myPosts
      : myPosts.filter((post) => post.type === activeTab);

  const loadingByTab: Record<MyPostType, boolean> = {
    ALL:
      isRecruitmentsLoading ||
      isInfoPostsLoading ||
      isApplicationsLoading ||
      isNoticesLoading,
    RECRUIT: isRecruitmentsLoading,
    INFO: isInfoPostsLoading,
    APPLY: isApplicationsLoading,
    NOTICE: isNoticesLoading,
  };

  const errorByTab: Record<MyPostType, boolean> = {
    ALL:
      isRecruitmentsError &&
      isInfoPostsError &&
      isApplicationsError &&
      isNoticesError,
    RECRUIT: isRecruitmentsError,
    INFO: isInfoPostsError,
    APPLY: isApplicationsError,
    NOTICE: isNoticesError,
  };

  const isLoading = loadingByTab[activeTab];
  const isError = errorByTab[activeTab];

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => router.push('/mypage')}
          aria-label="마이페이지로 돌아가기"
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
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`cursor-pointer rounded-2xl px-4 py-2 transition-all duration-150 active:scale-95 ${
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
            {isLoading ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                내역을 불러오는 중입니다.
              </div>
            ) : isError ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                내역을 불러오지 못했습니다.
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                내역이 없습니다.
              </div>
            ) : (
              filteredPosts.map((post) => {
                if (post.type === 'INFO') {
                  return (
                    <InfoPostCard
                      key={`info-${post.infoPostId}`}
                      infoPost={post}
                      onClick={() =>
                        router.push(`/infoPost/${post.infoPostId}`)
                      }
                    />
                  );
                }

                if (post.type === 'APPLY') {
                  return (
                    <ApplicationCard
                      key={`application-${post.applicationId}`}
                      application={post}
                      onClick={() =>
                        router.push(`/application/${post.applicationId}`)
                      }
                      onCancel={() => cancelApplication(post.applicationId)}
                      isCancelling={
                        isCancelling &&
                        cancellingApplicationId === post.applicationId
                      }
                    />
                  );
                }

                if (post.type === 'NOTICE') {
                  return (
                    <NoticeCard
                      key={`notice-${post.noticeId}`}
                      notice={post}
                      onClick={() =>
                        router.push(
                          `/team/${post.teamId}/notice/${post.noticeId}`
                        )
                      }
                    />
                  );
                }

                return (
                  <RecruitmentCard
                    key={`recruitment-${post.recruitmentId}`}
                    recruitment={post}
                    onClick={() =>
                      router.push(`/recruitment/${post.recruitmentId}`)
                    }
                  />
                );
              })
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
  recruitment: MyRecruitmentResponse;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] cursor-pointer flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
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

function InfoPostCard({
  infoPost,
  onClick,
}: {
  infoPost: InfoPostSummaryResponse;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] cursor-pointer justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="line-clamp-1 min-w-0 text-[19px] font-bold text-[#2C2C2C]">
              [ {getCategoryLabel(infoPost.category)} ] {infoPost.title}
            </h2>

            <span className="shrink-0 rounded-full bg-[#EAF2FF] px-4 py-1.5 text-[12px] font-semibold text-[#5E92F0]">
              정보
            </span>
          </div>

          <p className="text-[14px] text-[#5C5C5C]">
            연결된 모집글 {infoPost.recruitmentCount}개
          </p>
        </div>

        <div className="mt-8 text-[13px] text-[#989898]">정보 게시글</div>
      </div>

      {infoPost.thumbnailUrl && (
        <div className="relative ml-4 h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-28">
          <Image
            src={infoPost.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover"
          />
        </div>
      )}
    </button>
  );
}

function ApplicationCard({
  application,
  onClick,
  onCancel,
  isCancelling,
}: {
  application: MyApplicationResponse;
  onClick: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick();
        }
      }}
      className="flex min-h-[180px] cursor-pointer flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 min-w-0 text-[19px] font-bold text-[#2C2C2C]">
            [ {getCategoryLabel(application.recruitmentCategory)} ] 신청서
          </h2>

          <div className="flex shrink-0 items-center gap-2">
            {application.applicationStatus === 'WAITING' && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={(event) => {
                  event.stopPropagation();
                  onCancel();
                }}
                className="cursor-pointer rounded-full border border-[#FFD3D3] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#E22222] transition-all duration-150 hover:bg-[#FFF5F5] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? '취소 중' : '지원 취소'}
              </button>
            )}
            <span className="rounded-full bg-[#EEF1F5] px-4 py-1.5 text-[12px] font-semibold text-[#5E92F0]">
              {getApplicationStatusLabel(application.applicationStatus)}
            </span>
          </div>
        </div>

        {/* {application.announcementTitle && (
          <p className="line-clamp-1 text-[14px] text-[#5C5C5C]">
            정보글 {application.announcementTitle}
          </p>
        )} */}

        <p className="mt-1 text-[14px] text-[#5C5C5C]">
          모집자 {application.recruiterName}
        </p>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#989898]">
          <span>신청일 {formatDate(application.createdAt)}</span>
          <span>·</span>
          <span>
            응답일{' '}
            {application.respondedAt
              ? formatDate(application.respondedAt)
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
function NoticeCard({
  notice,
  onClick,
}: {
  notice: MyTeamNoticeResponse;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] cursor-pointer flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="line-clamp-1 text-[19px] font-bold text-[#2C2C2C]">
            [ 공지 ] {notice.title}
          </h2>

          <span
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${
              notice.isRead
                ? 'bg-[#EEF1F5] text-[#989898]'
                : 'bg-[#5E92F0] text-white'
            }`}
          >
            {notice.isRead ? '읽음' : '안읽음'}
          </span>
        </div>

        <p className="text-[14px] text-[#5C5C5C]">
          {notice.teamName} · {notice.authorName}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[13px] text-[#989898]">
        <span>{formatDate(notice.createdAt)}</span>

        {notice.isPinned && (
          <>
            <span>·</span>
            <span>고정됨</span>
          </>
        )}
      </div>
    </button>
  );
}
