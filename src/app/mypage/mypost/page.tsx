'use client';

import { useRouter } from 'next/navigation';

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

import type { MyPost, MyPostType } from '@/types/mypagePost';
import { formatDate } from '@/utils/date/formatDate';
import { getDday } from '@/utils/date/getDday';
import Header from '@/components/common/Header';
import ContentCard from '@/components/common/ContentCard';
//이걸 복붙해서 사용해주세요
//Header 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '내가 작성한 글';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = false;

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = true;

const categories: { label: string; value: MyPostType }[] = [
  { label: '전체', value: 'ALL' },
  { label: '모집', value: 'RECRUITMENT' },
  { label: '정보', value: 'INFOPOST' },
  { label: '신청', value: 'APPLICATION' },
  { label: '공지', value: 'NOTICE' },
];

export default function MyPostPage() {
  const [selectedCategory, setSelectedCategory] = useState<MyPostType>('ALL');

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

  const infoPosts = infoPostsPage?.content ?? [];

  const myPosts: MyPost[] = [
    ...recruitments.map((recruitment) => ({
      ...recruitment,
      type: 'RECRUITMENT' as const,
    })),
    ...infoPosts.map((infoPost) => ({
      ...infoPost,
      type: 'INFOPOST' as const,
    })),
    ...applications.map((application) => ({
      ...application,
      type: 'APPLICATION' as const,
    })),
    ...notices.map((notice) => ({
      ...notice,
      type: 'NOTICE' as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPosts =
    selectedCategory === 'ALL'
      ? myPosts
      : myPosts.filter((post) => post.type === selectedCategory);

  const loadingByTab: Record<MyPostType, boolean> = {
    ALL:
      isRecruitmentsLoading ||
      isInfoPostsLoading ||
      isApplicationsLoading ||
      isNoticesLoading,
    RECRUITMENT: isRecruitmentsLoading,
    INFOPOST: isInfoPostsLoading,
    APPLICATION: isApplicationsLoading,
    NOTICE: isNoticesLoading,
  };

  const errorByTab: Record<MyPostType, boolean> = {
    ALL:
      isRecruitmentsError &&
      isInfoPostsError &&
      isApplicationsError &&
      isNoticesError,
    RECRUITMENT: isRecruitmentsError,
    INFOPOST: isInfoPostsError,
    APPLICATION: isApplicationsError,
    NOTICE: isNoticesError,
  };

  const isLoading = loadingByTab[selectedCategory];
  const isError = errorByTab[selectedCategory];

  const isEmpty = !isLoading && !isError && filteredPosts.length === 0;

  const handleCategoryChange = (category: string) => {
    if (
      category !== 'ALL' &&
      category !== 'RECRUITMENT' &&
      category !== 'INFOPOST' &&
      category !== 'APPLICATION' &&
      category !== 'NOTICE'
    ) {
      return;
    }

    setSelectedCategory(category);
  };
  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <NotificationButton />
      <div className="mx-auto mb-20 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <section className="mx-auto max-w-[1180px]">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
                내역을 불러오는 중입니다
              </div>
            ) : isError ? (
              <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
                내역을 불러오지 못했습니다
              </div>
            ) : isEmpty ? (
              <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
                작성한 내역이 없습니다
              </div>
            ) : (
              filteredPosts.map((post) => {
                if (post.type === 'INFOPOST') {
                  return (
                    <ContentCard
                      key={`info-${post.infoPostId}`}
                      cardType="infoPost"
                      category={post.category}
                      title={post.title}
                      path={`/infoPost/${post.infoPostId}`}
                      createdAt={formatDate(post.createdAt)}
                      content={post.type}
                    />
                  );
                }
                if (post.type === 'APPLICATION') {
                  return (
                    <ContentCard
                      key={`application-${post.applicationId}`}
                      cardType="application"
                      category={post.recruitmentCategory}
                      title="신청서"
                      path={`/application/${post.applicationId}`}
                      createdAt={formatDate(post.createdAt)}
                      cardStatus={post.applicationStatus}
                      content={post.recruiterName ?? ''}
                    />
                  );
                }

                if (post.type === 'NOTICE') {
                  return (
                    <ContentCard
                      key={`notice-${post.noticeId}`}
                      cardType="notice"
                      category={post.teamCategory}
                      title={post.title}
                      path={`/team/${post.teamId}/notice/${post.noticeId}`}
                      createdAt={formatDate(post.createdAt)}
                      updatedAt={formatDate(post.updatedAt)}
                      content={post.teamName}
                      cardStatus={post.isRead ? 'READ' : 'UNREAD'}
                    />
                  );
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const endDate = new Date(post.endAt);
                endDate.setHours(0, 0, 0, 0);

                const isClosed = endDate < today || !post.isOpened;

                return (
                  <ContentCard
                    key={`recruitment-${post.recruitmentId}`}
                    cardType="recruitment"
                    category={post.category}
                    title={post.title}
                    path={`/recruitment/${post.recruitmentId}`}
                    startAt={formatDate(post.createdAt)}
                    endAt={formatDate(post.endAt)}
                    dDay={getDday(post.endAt)}
                    cardStatus={isClosed ? 'CLOSED' : 'OPEN'}
                    content=""
                  />
                );
              })
            )}
          </section>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}
