'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '@/components/main/Card';
import {
  useRecruitmentDetail,
  useDeleteRecruitment,
} from '@/hooks/useRecruitmentQuery';
import { useSchoolVerificationGuard } from '@/hooks/useSchoolVerificationGuard';
import { formatDate } from '@/utils/date/formatDate';
import { getDday } from '@/utils/date/getDday';
import { categoryMap, categoryColorMap } from '@/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function RecruitmentDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const recruitmentId = Number(params.id);

  const { data: recruitment, isLoading } = useRecruitmentDetail(recruitmentId);
  const { mutate: deleteRecruitmentMutate, isPending: isDeleting } =
    useDeleteRecruitment();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { errorMessage, showErrorMessage, setErrorMessage } = useErrorToast(
    1800,
    searchParams.get('error') === 'school-verification-required'
      ? '학교 인증 후 이용 가능합니다'
      : ''
  );
  const { checkVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (!errorMessage) return;

    router.replace(`/recruitment/${recruitmentId}`);

    const timer = setTimeout(() => setErrorMessage(''), 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return null;
  if (!recruitment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 게시글입니다.
        </p>
      </main>
    );
  }

  const hasAnnouncement =
    recruitment.announcementId !== null &&
    recruitment.announcementId !== undefined &&
    recruitment.announcementTitle;

  const isClosed =
    new Date(recruitment.endAt) < new Date() || recruitment.status === 'CLOSED';

  const isRecruiter = recruitment.isRecruiter;

  const isDisabled = recruitment.hasApplied || isClosed;

  const handleDeleteRecruitment = () => {
    if (isDeleting) return;
    deleteRecruitmentMutate(recruitmentId, {
      onSuccess: () => {
        router.push('/recruitment');
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-16 items-center justify-between px-6 sm:h-18"
            style={{
              backgroundColor:
                categoryColorMap[recruitment.category] ?? '#E9E9E9',
            }}
          >
            <button
              onClick={() => router.push('/recruitment')}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="sm:h-7 sm:w-7"
              />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="cursor-pointer text-[#2C2C2C]"
              >
                <Ellipsis size={20} className="sm:h-[22px] sm:w-[22px]" />
              </button>

              {isMenuOpen && isRecruiter && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute top-6 right-[-10px] z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                    {!isClosed && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/recruitment/${recruitmentId}/edit`);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                      >
                        수정하기
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteConfirmOpen(true);
                      }}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA] disabled:opacity-50"
                    >
                      삭제하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
              {recruitment.title}
            </h1>

            {hasAnnouncement ? (
              <button className="mt-3 cursor-pointer rounded-xl bg-[#EEF1F5] px-3 py-1.5 text-[12px] text-[#2C2C2C] transition hover:bg-[#E3E7EB] sm:mt-4 sm:px-4 sm:text-sm">
                &lt;{recruitment.announcementTitle}&gt; 바로가기
              </button>
            ) : (
              <button
                disabled
                className="mt-3 cursor-not-allowed rounded-xl bg-[#EEF1F5] px-3 py-1.5 text-[12px] text-[#989898] sm:mt-4 sm:px-4 sm:text-sm"
              >
                연결된 정보글이 없습니다
              </button>
            )}

            <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 text-[13px] sm:mt-8 sm:grid-cols-[90px_1fr] sm:gap-y-5 sm:text-[15px]">
              <span className="text-[#989898]">종류</span>
              <span className="text-[#2C2C2C]">
                {categoryMap[recruitment.category]}
              </span>

              <span className="text-[#989898]">모집현황</span>
              <div>
                <span
                  className={`rounded-xl px-3 py-1 text-[11px] font-medium sm:text-sm ${
                    isClosed
                      ? 'bg-[#EEF1F5] text-[#989898]'
                      : 'bg-[#A7ECA7] text-[#1F4D1A]'
                  }`}
                >
                  {isClosed ? '모집마감' : '모집중'}
                </span>
              </div>

              <span className="text-[#989898]">모집마감</span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[#2c2c2c]">
                  {formatDate(recruitment.endAt)}
                </p>

                <span className="font-medium text-[#5E92F0]">
                  {getDday(recruitment.endAt)}
                </span>
              </div>

              <span className="text-[#989898]">모집인원</span>
              <span className="text-[#2C2C2C]">
                {recruitment.targetMemberCount}명
              </span>

              <span className="text-[#989898]">작성자</span>
              <span className="text-[#2C2C2C]">
                {recruitment.recruiterName}
              </span>
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5] sm:mt-8" />

            <section className="mt-5 sm:mt-6">
              <h2 className="text-[13px] text-[#989898] sm:text-[15px]">
                상세요강
              </h2>

              <p className="mt-3 text-[14px] leading-7 whitespace-pre-wrap text-[#2C2C2C] sm:mt-4 sm:text-[15px] sm:leading-8">
                {recruitment.description}
              </p>
            </section>

            <div className="mt-14 border-b-[0.5px] border-[#D6DDE5] sm:mt-20" />

            <div className="mt-6 mb-30 flex justify-center">
              <button
                disabled={isRecruiter ? false : isDisabled}
                onClick={() => {
                  if (isRecruiter) {
                    router.push(
                      `/recruitment/${recruitmentId}/apply/applications`
                    );
                    return;
                  }
                  if (!checkVerified()) return;
                  router.push(`/recruitment/${recruitmentId}/apply`);
                }}
                className={`rounded-xl px-5 py-2 text-[14px] transition sm:px-6 sm:text-base ${
                  !isRecruiter && isDisabled
                    ? 'cursor-not-allowed bg-[#EEF1F5] text-[#989898]'
                    : 'cursor-pointer bg-[#5E92F0] text-white hover:bg-[#5C86EB]'
                }`}
              >
                {isRecruiter
                  ? '지원자 보기'
                  : recruitment.hasApplied
                    ? '지원 완료'
                    : isClosed
                      ? '모집 마감'
                      : '지원하기'}
              </button>
            </div>
          </div>
        </Card>
        {isDeleteConfirmOpen && (
          <div
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-center text-xl font-bold">
                모집글을 삭제할까요?
              </h2>

              <p className="mt-2 text-center text-sm text-[#989898]">
                삭제한 모집글은 복구할 수 없어요
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold"
                >
                  취소
                </button>

                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    handleDeleteRecruitment();
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-3 font-semibold text-white"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
