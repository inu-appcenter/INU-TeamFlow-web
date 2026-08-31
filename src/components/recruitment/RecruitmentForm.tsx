'use client';

import Card from '@/components/main/Card';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Search, ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMyTeams } from '@/hooks/team/useTeamQuery';
import { useInfoPosts } from '@/hooks/useInfoPostQuery';
import { getMyInfoPostScraps } from '@/api/scrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import Checkbox from '@/components/common/Checkbox';
import type {
  InfoPostSummaryResponse,
  InfoPostCategory,
  GetInfoPostsParams,
} from '@/types/infoPost';
import {
  categoryMap,
  categoryColorMap,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/category';
import {
  infoPostCategoryFilterOptions,
  infoPostCategoryColorMap,
  infoPostCategoryMap,
} from '@/constants/infoPost';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useRouter } from 'next/navigation';
import { darkenColor } from '@/utils/color/darkenColor';

export type RecruitmentFormData = {
  title: string;
  category: 'CONTEST' | 'STUDY' | 'CLUB' | 'PROJECT' | 'ETC';
  description: string;
  announcementId?: number;
  announcementTitle?: string;
  teamId?: number;
  targetMemberCount: number | '';
  endAt: string;
};

type RecruitmentFormProps = {
  mode: 'create' | 'edit';
  initialData?: RecruitmentFormData;
  onSubmit: (data: RecruitmentFormData) => Promise<void>;
  onDelete?: () => void;
};

const INFO_POST_MODAL_SIZE = 9;
const LINKABLE_INFO_POST_CATEGORIES: InfoPostCategory[] = [
  'CONTEST',
  'CLUB',
  'EXTERNAL_ACTIVITY',
  'INTERN',
];

export default function RecruitmentForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
}: RecruitmentFormProps) {
  const router = useRouter();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [form, setForm] = useState<RecruitmentFormData>(
    initialData ?? {
      title: '',
      category: 'ETC',
      description: '',
      announcementId: undefined,
      announcementTitle: undefined,
      teamId: undefined,
      targetMemberCount: '',
      endAt: '',
    }
  );

  const { data: myTeams = [] } = useMyTeams();
  const manageableTeams = myTeams.filter(
    (t) => t.teamRole === 'LEADER' || t.teamRole === 'MANAGER'
  );

  const onChange = (key: keyof RecruitmentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const currentColor =
    categoryColorMap[form.category] ?? DEFAULT_CATEGORY_COLOR;
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // ---- 공고(정보글) 연결 모달 ----
  const [isInfoPostModalOpen, setIsInfoPostModalOpen] = useState(false);
  useLockBodyScroll(isInfoPostModalOpen);
  const [selectedInfoPostTitle, setSelectedInfoPostTitle] = useState(
    initialData?.announcementTitle ?? ''
  );

  const [infoCategory, setInfoCategory] = useState<InfoPostCategory>(
    LINKABLE_INFO_POST_CATEGORIES[0]
  );
  const [infoKeywordInput, setInfoKeywordInput] = useState('');
  const [infoSearchKeyword, setInfoSearchKeyword] = useState('');
  const [infoPage, setInfoPage] = useState(1);
  // 내가 스크랩한 정보글만 보기
  const [onlyScrapped, setOnlyScrapped] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInfoSearchKeyword(infoKeywordInput.trim());
      setInfoPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [infoKeywordInput]);

  const handleInfoCategoryChange = (category: InfoPostCategory) => {
    setInfoCategory(category);
    setInfoPage(1);
  };

  const handleToggleOnlyScrapped = (checked: boolean) => {
    setOnlyScrapped(checked);
    setInfoPage(1);
  };

  const infoQueryParams: GetInfoPostsParams = {
    category: infoCategory,
    keyword: infoSearchKeyword || undefined,
    page: infoPage - 1,
    size: INFO_POST_MODAL_SIZE,
    sort: ['createdAt,DESC'],
  };

  // 카테고리/검색어 기반 일반 목록 (스크랩 필터가 꺼져 있을 때만 조회)
  const { data: categoryInfoPostPage, isLoading: isCategoryInfoPostsLoading } =
    useInfoPosts(infoQueryParams, { enabled: !onlyScrapped });

  // 내가 스크랩한 정보글 목록 (스크랩 필터가 켜져 있을 때만 조회)
  const { data: myScrapInfoPostPage, isLoading: isMyScrapInfoPostsLoading } =
    useQuery({
      queryKey: [
        'scraps',
        'infoPosts',
        'page',
        infoPage - 1,
        INFO_POST_MODAL_SIZE,
      ],
      queryFn: () => getMyInfoPostScraps(infoPage - 1, INFO_POST_MODAL_SIZE),
      enabled: onlyScrapped,
      placeholderData: keepPreviousData,
    });

  const connectInfoPostPage = onlyScrapped
    ? myScrapInfoPostPage
    : categoryInfoPostPage;
  const isConnectInfoPostsLoading = onlyScrapped
    ? isMyScrapInfoPostsLoading
    : isCategoryInfoPostsLoading;

  const linkableInfoPostCategoryOptions = infoPostCategoryFilterOptions.filter(
    (category) =>
      LINKABLE_INFO_POST_CATEGORIES.includes(category.value as InfoPostCategory)
  );

  const connectInfoPosts: InfoPostSummaryResponse[] =
    connectInfoPostPage?.content ?? [];

  const connectTotalPages = connectInfoPostPage?.totalPages ?? 0;
  const currentInfoPage =
    connectTotalPages === 0 ? 1 : Math.min(infoPage, connectTotalPages);
  const PAGE_WINDOW_SIZE = 5;
  const currentBlockStart =
    Math.floor((currentInfoPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const currentBlockEnd = Math.min(
    currentBlockStart + PAGE_WINDOW_SIZE - 1,
    connectTotalPages
  );
  const visiblePageNumbers = Array.from(
    { length: currentBlockEnd - currentBlockStart + 1 },
    (_, i) => currentBlockStart + i
  );

  const handleSelectInfoPost = (post: InfoPostSummaryResponse) => {
    if (!post.linkable) return;

    setForm((prev) => ({ ...prev, announcementId: post.infoPostId }));
    setSelectedInfoPostTitle(post.title);
    setIsInfoPostModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="relative flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

          {/* 헤더 */}
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: currentColor }}
          >
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <div className="mx-auto max-w-[600px]">
              {/* 제목 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    제목
                  </span>
                </div>
                <input
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  className="border-[#D6DDE5]/40/40 h-[42px] w-full rounded-xl border-[0.5px] bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 공고 연결 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집글 공고
                  </span>
                  {mode === 'edit' && (
                    <span className="text-xs text-[#9a9a9a]">
                      (수정할 수 없습니다)
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <input
                    readOnly
                    value={selectedInfoPostTitle}
                    placeholder="연결된 공고가 없습니다"
                    className="h-[42px] flex-1 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 focus:ring-0 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setIsInfoPostModalOpen(true)}
                    disabled={mode === 'edit'}
                    className={`h-[42px] shrink-0 rounded-xl px-4 text-[15px] text-white transition-all duration-150 ${
                      mode === 'edit'
                        ? 'cursor-not-allowed bg-[#C7CDD5]/80'
                        : 'cursor-pointer bg-[#5E92F0] active:scale-90'
                    }`}
                  >
                    공고 연결하기
                  </button>
                </div>
              </div>

              {/* 팀 연결 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집글 팀
                  </span>
                  {mode === 'edit' && (
                    <span className="text-xs text-[#9a9a9a]">
                      (수정할 수 없습니다)
                    </span>
                  )}
                </div>

                <div className="relative flex items-end gap-3">
                  <input
                    readOnly
                    value={
                      myTeams.find((t) => t.teamId === form.teamId)?.name ?? ''
                    }
                    placeholder="연결된 팀이 없습니다"
                    className="h-[42px] flex-1 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 focus:ring-0 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setIsTeamDropdownOpen((prev) => !prev)}
                    disabled={mode === 'edit'}
                    className={`h-[42px] shrink-0 rounded-xl px-4 text-[15px] text-white transition-all duration-150 ${
                      mode === 'edit'
                        ? 'cursor-not-allowed bg-[#C7CDD5]/80'
                        : 'cursor-pointer bg-[#5E92F0] active:scale-90'
                    }`}
                  >
                    팀 연결하기
                  </button>

                  {isTeamDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTeamDropdownOpen(false)}
                      />
                      <div className="absolute top-[50px] right-[-70px] z-20 w-[260px] rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-white p-2 shadow-[2px_2px_15px_0px_rgba(149,157,165,0.20)]">
                        <div className="thin-scrollbar flex max-h-[240px] flex-col overflow-y-auto">
                          {manageableTeams.map((team) => (
                            <button
                              key={team.teamId}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  teamId: team.teamId,
                                  category: team.category,
                                }));
                                setIsTeamDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between rounded-xl px-4 py-2 text-left transition hover:bg-[#F6F8FA] ${
                                form.teamId === team.teamId
                                  ? 'bg-[#EEF1F5]'
                                  : ''
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-[#2C2C2C]">
                                  {team.name}
                                </p>
                                <p className="text-xs text-[#989898]">
                                  {categoryMap[team.category]}
                                </p>
                              </div>
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                  form.teamId === team.teamId
                                    ? 'border-[#5E92F0]'
                                    : 'border-[#D6DDE5]/40'
                                }`}
                              >
                                {form.teamId === team.teamId && (
                                  <div className="h-2 w-2 rounded-full bg-[#5E92F0]" />
                                )}
                              </div>
                            </button>
                          ))}

                          {manageableTeams.length === 0 && (
                            <p className="py-4 text-center text-sm text-[#989898]">
                              매니저 이상 권한을 가진 팀이 없습니다
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="py-2">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wide text-[#B0B0B0]">
                    카테고리
                  </span>
                  <span className="text-xs text-[#9A9A9A]">
                    (팀 연결 시 자동 설정)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(categoryMap).map((key) => {
                    const typedKey = key as keyof typeof categoryMap;
                    const isSelected = form.category === typedKey;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled
                        className={`rounded-2xl border-[0.5px] px-4 py-2 text-sm transition-all ${
                          isSelected
                            ? 'font-semibold opacity-100'
                            : 'opacity-40'
                        }`}
                        style={{
                          backgroundColor: categoryColorMap[typedKey],
                          borderColor: darkenColor(
                            categoryColorMap[typedKey],
                            30
                          ),
                          color: darkenColor(categoryColorMap[typedKey], 140),
                          cursor: 'not-allowed',
                        }}
                      >
                        {categoryMap[typedKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 마감일 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    마감일
                  </span>
                </div>
                <input
                  type="date"
                  value={form.endAt}
                  onChange={(e) => onChange('endAt', e.target.value)}
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 모집 인원 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집 인원
                  </span>
                </div>
                <input
                  type="number"
                  value={form.targetMemberCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetMemberCount:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 상세요강 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    상세요강
                  </span>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  maxLength={500}
                  className="min-h-[150px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                  placeholder="ex. 우대사항, 면접 정보 등"
                />
                <div className="mt-1 text-right text-xs text-[#B0B0B0]">
                  {form.description.length}/500
                </div>
              </div>

              <div className="mb-8 flex justify-center gap-2">
                {mode === 'edit' && onDelete && (
                  <button
                    onClick={onDelete}
                    className="cursor-pointer rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-8 py-2 font-semibold text-[#E22222]"
                  >
                    삭제
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (!form.title.trim()) {
                      showErrorMessage('모집글 제목을 입력해주세요');
                      return;
                    }
                    if (!form.description.trim()) {
                      showErrorMessage('상세요강을 입력해주세요');
                      return;
                    }
                    if (!form.endAt) {
                      showErrorMessage('모집 마감일을 입력해주세요');
                      return;
                    }
                    if (!form.targetMemberCount) {
                      showErrorMessage('모집 인원을 입력해주세요');
                      return;
                    }
                    if (!form.teamId) {
                      showErrorMessage('연결할 팀을 선택해주세요');
                      return;
                    }

                    if (mode === 'create') {
                      setIsConfirmOpen(true);
                    } else {
                      await onSubmit({
                        ...form,
                        endAt: new Date(`${form.endAt}T00:00:00`).toISOString(),
                      });
                    }
                  }}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0] px-10 py-2 text-base font-medium text-white transition hover:bg-[#5C86EB]"
                >
                  {mode === 'create' ? '등록' : '수정'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 공고 연결하기 모달 */}
      {isInfoPostModalOpen && (
        <div
          onClick={() => setIsInfoPostModalOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop flex h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-3xl bg-white"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5]/40 px-6 py-5">
              <h2 className="text-xl font-bold text-[#2C2C2C]">
                공고 연결하기
              </h2>
            </div>

            {/* 카테고리 탭 (스크랩 필터가 켜지면 비활성화됩니다) */}
            <div
              className={`relative flex border-b-[0.5px] border-[#D6DDE5]/40 ${
                onlyScrapped ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              {linkableInfoPostCategoryOptions.map((category) => {
                const isActive =
                  !onlyScrapped && infoCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      handleInfoCategoryChange(
                        category.value as InfoPostCategory
                      )
                    }
                    className={`relative z-50 flex-1 cursor-pointer py-3 text-center text-[20px] font-bold whitespace-nowrap transition ${
                      isActive
                        ? 'text-[#5E92F0]'
                        : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                    }`}
                  >
                    {category.label}
                    {isActive && (
                      <motion.div
                        layoutId="infoPostConnectCategoryIndicator"
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

            {/* 검색 + 스크랩 필터 */}
            <div className="flex w-full items-center justify-between px-6 py-3">
              <div className="w-100">
                <div
                  className={`flex h-10 flex-1 items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-3 ${
                    onlyScrapped ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <Search size={16} className="shrink-0 text-[#989898]" />
                  <input
                    value={infoKeywordInput}
                    onChange={(e) => setInfoKeywordInput(e.target.value)}
                    placeholder="제목을 입력하세요"
                    disabled={onlyScrapped}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#989898]"
                  />
                </div>
              </div>

              <Checkbox
                checked={onlyScrapped}
                onChange={handleToggleOnlyScrapped}
                label="스크랩한 글만 보기"
                size="sm"
                className="shrink-0 text-sm font-medium whitespace-nowrap text-[#989898]"
              />
            </div>

            {/* 리스트 */}
            <div
              className="thin-scrollbar flex-1 overflow-y-auto px-6 pb-4"
              style={{ scrollbarGutter: 'stable' }}
            >
              {isConnectInfoPostsLoading && (
                <div className="flex h-[240px] items-center justify-center text-sm text-[#989898]">
                  불러오는 중입니다
                </div>
              )}

              {!isConnectInfoPostsLoading && connectInfoPosts.length === 0 && (
                <div className="flex h-[240px] items-center justify-center text-sm text-[#989898]">
                  {onlyScrapped
                    ? '스크랩한 정보글이 없습니다'
                    : '연결 가능한 공고가 없습니다'}
                </div>
              )}

              {!isConnectInfoPostsLoading && connectInfoPosts.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                  {connectInfoPosts.map((post) => {
                    const isSelected = form.announcementId === post.infoPostId;
                    const isDisabled = !post.linkable;

                    return (
                      <div
                        key={post.infoPostId}
                        className={`flex flex-col overflow-hidden rounded-2xl border-[0.5px] transition ${
                          isSelected
                            ? 'border-[#5E92F0] ring-2 ring-[#5E92F0]/30'
                            : 'border-[#D6DDE5]/40'
                        } ${isDisabled ? 'opacity-50' : ''}`}
                      >
                        <div className="relative aspect-[4/3] w-full bg-[#F6F8FA]">
                          {post.thumbnailUrl ? (
                            <Image
                              src={post.thumbnailUrl}
                              alt={`${post.title} 썸네일`}
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#B8C0CA]">
                              <ImageIcon size={22} strokeWidth={1.7} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-1.5 p-3">
                          <span
                            style={{
                              backgroundColor:
                                infoPostCategoryColorMap[post.category],
                              color: darkenColor(
                                infoPostCategoryColorMap[post.category],
                                140
                              ),
                            }}
                            className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          >
                            {infoPostCategoryMap[post.category]}
                          </span>

                          <p className="line-clamp-2 text-[15px] font-semibold text-[#2C2C2C]">
                            {post.title}
                          </p>

                          <p className="mt-auto text-[12px] text-[#989898]">
                            연결된 모집글 {post.recruitmentCount}개
                          </p>

                          <button
                            type="button"
                            onClick={() => handleSelectInfoPost(post)}
                            disabled={isDisabled}
                            className={`mt-1 h-8 shrink-0 rounded-lg text-[13px] font-semibold transition ${
                              isDisabled
                                ? 'cursor-not-allowed bg-[#EEF1F5] text-[#B0B0B0]'
                                : isSelected
                                  ? 'cursor-pointer bg-[#EEF1F5] text-[#5E92F0]'
                                  : 'cursor-pointer bg-[#5E92F0] text-white hover:bg-[#4F84E5]'
                            }`}
                          >
                            {isDisabled
                              ? '연결 불가'
                              : isSelected
                                ? '선택됨'
                                : '공고 선택하기'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* 페이지네이션 */}
              {connectTotalPages > 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  {/* 이전 블록 */}
                  <button
                    type="button"
                    onClick={() =>
                      setInfoPage(
                        Math.max(1, currentBlockStart - PAGE_WINDOW_SIZE)
                      )
                    }
                    disabled={currentBlockStart === 1}
                    className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
                  >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                  </button>

                  {visiblePageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setInfoPage(n)}
                      className={`flex items-center justify-center px-1 text-[16px] font-semibold transition-all duration-150 active:scale-90 ${
                        currentInfoPage === n
                          ? 'text-[#5E92F0]'
                          : 'cursor-pointer text-[#2c2c2c]/50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  {/* 다음 블록 */}
                  <button
                    type="button"
                    onClick={() =>
                      setInfoPage(
                        Math.min(
                          connectTotalPages,
                          currentBlockStart + PAGE_WINDOW_SIZE
                        )
                      )
                    }
                    disabled={currentBlockEnd === connectTotalPages}
                    className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
                  >
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && isConfirmOpen && (
        <div
          onClick={() => setIsConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold">
              모집글을 생성할까요?
            </h2>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  setIsConfirmOpen(false);
                  await onSubmit({
                    ...form,
                    endAt: new Date(`${form.endAt}T00:00:00`).toISOString(),
                  });
                }}
                className="flex-1 rounded-xl bg-[#5E92F0] py-3 font-semibold text-white"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
