'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Card from '@/components/main/Card';
import RecruitmentDetailSkeleton from '@/components/skeleton/RecruitmentDetailSkeleton';
import {
  useRecruitmentDetail,
  useDeleteRecruitment,
} from '@moimi/core/hooks/useRecruitmentQuery';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import { formatDate } from '@/utils/date/formatDate';
import { getDday } from '@/utils/date/getDday';
import { categoryMap } from '@moimi/core/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCreateDirectChatRoom } from '@moimi/core/hooks/chat/useCreateDirectChatRoom';
import { useCreateReport } from '@moimi/core/hooks/useCreateReport';
import ReportModal from '@/components/report/ReportModal';
import type { ReportRequest } from '@moimi/core/types/report';
import PostDeleteConfirmModal from '@/components/common/PostDeleteConfirmModal';
import RecruitmentDetailActions from '@/components/recruitment/RecruitmentDetailActions';
export default function RecruitmentDetail() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);

  const { data: recruitment, isLoading } = useRecruitmentDetail(recruitmentId);
  const { mutate: deleteRecruitmentMutate, isPending: isDeleting } =
    useDeleteRecruitment();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { mutate: createReport, isPending: isReportSubmitting } =
    useCreateReport();
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();

  const { errorMessage, showErrorMessage } = useErrorToast();
  const { checkVerified } = useSchoolVerificationGuard(showErrorMessage);

  if (isLoading) {
    return (
      <RecruitmentDetailSkeleton onBack={() => router.push('/recruitment')} />
    );
  }
  if (!recruitment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 게시글입니다.
        </p>
      </main>
    );
  }

  const handleStartDirectChat = async () => {
    const room = await createDirectRoom(recruitment.recruiterId);
    router.push(
      `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
    );
  };

  const hasAnnouncement =
    recruitment.infoPostId !== null &&
    recruitment.infoPostId !== undefined &&
    recruitment.infoPostTitle;

  const isClosed =
    new Date(recruitment.endAt) < new Date() || !recruitment.isOpened;

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
  const handleSubmitReport = ({ reason, detail }: ReportRequest) => {
    createReport(
      {
        target: { type: 'RECRUITMENT_POST', id: recruitmentId },
        body: { reason, detail },
      },
      {
        onSuccess: () => {
          setIsReportModalOpen(false);
          showErrorMessage('신고가 접수되었습니다');
        },
        onError: () => showErrorMessage('신고 접수에 실패했습니다'),
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <RecruitmentDetailActions
            category={recruitment.category}
            recruitmentId={recruitment.recruitmentId}
            isRecruiter={isRecruiter}
            isClosed={isClosed}
            isDeleting={isDeleting}
            isScrap={recruitment.isScrap}
            onBack={() => router.push('/recruitment')}
            onEdit={() => router.push(`/recruitment/${recruitmentId}/edit`)}
            onDelete={() => setIsDeleteConfirmOpen(true)}
            onReport={() => setIsReportModalOpen(true)}
          />
          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
              {recruitment.title}
            </h1>

            {hasAnnouncement ? (
              <button
                onClick={() =>
                  router.push(`/infoPost/${recruitment.infoPostId}`)
                }
                className="mt-3 cursor-pointer rounded-xl bg-[#EEF1F5] px-3 py-1.5 text-[12px] text-[#2C2C2C] transition transition-all duration-150 active:scale-90 sm:mt-4 sm:px-4 sm:text-sm"
              >
                &lt;{recruitment.infoPostTitle}&gt; 바로가기
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
                  className={`rounded-full px-3 py-1 text-[11px] font-medium sm:text-[13px] ${
                    isClosed
                      ? 'bg-[#EEF1F5] text-[#989898]'
                      : 'bg-[#DDF7E5] text-[#2E7845]'
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
              <div className="flex items-center gap-4">
                <span className="text-[#2C2C2C]">
                  {recruitment.recruiterName}
                </span>
                {!isRecruiter && (
                  <button
                    onClick={handleStartDirectChat}
                    disabled={isCreatingRoom}
                    className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-3 py-0.5 text-[11px] text-[#2c2c2c] transition hover:text-[#5E92F0] disabled:opacity-50 sm:text-sm"
                  >
                    1:1 채팅
                  </button>
                )}
              </div>
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
                className={`rounded-xl px-8 py-2 text-base transition ${
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
          <PostDeleteConfirmModal
            postLabel="모집글"
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={() => {
              setIsDeleteConfirmOpen(false);
              handleDeleteRecruitment();
            }}
          />
        )}
        <AnimatePresence>
          {isReportModalOpen && (
            <ReportModal
              targetLabel="이 모집글"
              isSubmitting={isReportSubmitting}
              onClose={() => {
                if (isReportSubmitting) return;
                setIsReportModalOpen(false);
              }}
              onSubmit={handleSubmitReport}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
