'use client';

import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from '@/components/main/Card';
import {
  useRecruitmentDetail,
  useApplicationDetail,
  useUpdateApplicationStatus,
} from '@/hooks/useRecruitmentQuery';
import { formatDate } from '@/utils/date/formatDate';
import { categoryColorMap } from '@/constants/category';
import type { ApplicationStatus } from '@/types/recruitment';
import { ApplicationDetailSkeleton } from '@/components/skeleton';
import { useCreateDirectChatRoom } from '@/hooks/chat/useCreateDirectChatRoom';
import { getDepartmentName } from '@/utils/getDepartmentName';

const statusLabelMap: Record<ApplicationStatus, string> = {
  WAITING: '대기중',
  ACCEPTED: '수락',
  DECLINED: '거절',
  CANCELLED: '취소',
};

const statusColorMap: Record<ApplicationStatus, string> = {
  WAITING: 'bg-[#EEF1F5] text-[#5E92F0]',
  ACCEPTED: 'bg-[#A7ECA7] text-[#1F4D1A]',
  DECLINED: 'bg-[#FFD3D3] text-[#B32424]',
  CANCELLED: 'bg-[#EEF1F5] text-[#989898]',
};

export default function ApplicationDetail() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);
  const applicationId = Number(params.applicationId);
  const [showJoinToast, setShowJoinToast] = useState(false);

  const { data: recruitment } = useRecruitmentDetail(recruitmentId);
  const { data: application, isLoading } = useApplicationDetail(applicationId);
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();

  if (isLoading) return <ApplicationDetailSkeleton />;

  if (!application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 지원서입니다.
        </p>
      </main>
    );
  }

  const isWaiting = application.applicationStatus === 'WAITING';

  const handleStartDirectChat = async () => {
    const room = await createDirectRoom(application.applicantId);
    router.push(
      `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
    );
  };

  const handleUpdateStatus = (status: 'ACCEPTED' | 'DECLINED') => {
    if (isPending) return;
    updateStatus(
      {
        applicationId,
        body: { applicationStatus: status },
      },
      {
        onSuccess: () => {
          if (status === 'ACCEPTED') {
            setShowJoinToast(true);
            setTimeout(() => setShowJoinToast(false), 2500);
          }
        },
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-18 items-center justify-between px-6"
            style={{
              backgroundColor: recruitment
                ? (categoryColorMap[recruitment.category] ?? '#E9E9E9')
                : '#E9E9E9',
            }}
          >
            <button
              onClick={() =>
                router.push(`/recruitment/${recruitmentId}/apply/applications`)
              }
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <div className="flex-1 items-center">
              <span
                className={`rounded-xl px-3 py-1 text-[13px] font-semibold sm:text-sm ${statusColorMap[application.applicationStatus]}`}
              >
                {statusLabelMap[application.applicationStatus]}
              </span>
            </div>

            <p className="mt-3 text-xl font-semibold text-[#2c2c2c]">
              {application.recruitmentTitle}
            </p>

            <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 text-[13px] sm:grid-cols-[90px_1fr] sm:gap-y-5 sm:text-[15px]">
              <span className="text-[#989898]">이름</span>
              <div className="flex items-center gap-4">
                <span>{application.applicantName}</span>
                {application.isRecruiter && (
                  <button
                    onClick={handleStartDirectChat}
                    disabled={isCreatingRoom}
                    className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-3 py-0.5 text-[11px] text-[#2c2c2c] transition hover:text-[#5E92F0] disabled:opacity-50 sm:text-sm"
                  >
                    1:1 채팅
                  </button>
                )}
              </div>
              <span className="text-[#989898]">학과</span>
              <span>{getDepartmentName(application.applicantDepartment)}</span>
              <span className="text-[#989898]">학번</span>
              <span>{application.applicantStudentNumber}</span>
              <span className="text-[#989898]">지원일</span>
              <span className="">{formatDate(application.createdAt)}</span>

              {application.respondedAt && (
                <>
                  <span className="text-[#989898]">응답일</span>
                  <span className="">
                    {formatDate(application.respondedAt)}
                  </span>
                </>
              )}
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5]" />

            <div className="mt-7">
              <p className="thin-scrollbar mt-4 w-full text-[#2C2C2C]">
                {application.introduction}
              </p>
            </div>

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5]" />

            {application.isRecruiter && isWaiting && (
              <div className="mt-8 mb-8 flex justify-center gap-3">
                <button
                  onClick={() => handleUpdateStatus('DECLINED')}
                  disabled={isPending}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-6 py-2 text-base font-semibold text-[#E22222] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      거절
                    </span>
                  ) : (
                    '거절'
                  )}
                </button>

                <button
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  disabled={isPending}
                  className="cursor-pointer rounded-xl bg-[#5E92F0] px-6 py-2 text-base text-white disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      수락
                    </span>
                  ) : (
                    '수락'
                  )}
                </button>
              </div>
            )}
          </div>
        </Card>
      </section>
      {showJoinToast && (
        <div className="animate-modal-pop absolute top-32 left-1/2 z-300 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {application.applicantName}님이 연결된 팀 멤버로 추가됐어요
        </div>
      )}
    </main>
  );
}
