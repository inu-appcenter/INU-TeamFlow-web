'use client';

import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/main/Card';
import {
  useRecruitmentDetail,
  useApplicationDetail,
  useUpdateApplicationStatus,
} from '@/hooks/useRecruitmentQuery';
import { formatDate } from '@/utils/date/formatDate';
import { categoryColorMap } from '@/constants/category';
import type { ApplicationStatus } from '@/types/recruitment';

const statusLabelMap: Record<ApplicationStatus, string> = {
  WAITING: '대기중',
  ACCEPTED: '수락됨',
  DECLINED: '거절됨',
  CANCELLED: '취소됨',
};

const statusColorMap: Record<ApplicationStatus, string> = {
  WAITING: 'bg-[#EEF1F5] text-[#989898]',
  ACCEPTED: 'bg-[#A7ECA7] text-[#1F4D1A]',
  DECLINED: 'bg-[#FFD3D3] text-[#B32424]',
  CANCELLED: 'bg-[#EEF1F5] text-[#989898]',
};

export default function ApplicationDetail() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);
  const applicationId = Number(params.applicationId);

  const { data: recruitment } = useRecruitmentDetail(recruitmentId);
  const { data: application, isLoading } = useApplicationDetail(applicationId);
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  if (isLoading) return null;

  if (!application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 지원서입니다.
        </p>
      </main>
    );
  }

  const isWaiting = application.status === 'WAITING';

  const handleUpdateStatus = (status: 'ACCEPTED' | 'DECLINED') => {
    if (isPending) return;
    updateStatus({
      applicationId,
      body: { applicationStatus: status },
    });
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-16 items-center justify-between px-6 sm:h-18"
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
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="sm:h-7 sm:w-7"
              />
            </button>
          </div>

          <div className="px-8 py-7 sm:px-10 sm:py-12">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
                {application.applicantName}님의 지원서
              </h1>

              <span
                className={`rounded-xl px-3 py-1 text-[11px] font-medium sm:text-sm ${statusColorMap[application.status]}`}
              >
                {statusLabelMap[application.status]}
              </span>
            </div>

            <p className="mt-2 text-[13px] text-[#989898] sm:text-[15px]">
              {application.recruitmentTitle}
            </p>

            <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 text-[13px] sm:mt-8 sm:grid-cols-[90px_1fr] sm:gap-y-5 sm:text-[15px]">
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

            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5] sm:mt-8" />

            <div className="mt-7">
              <p className="thin-scrollbar mt-4 w-full text-[#2C2C2C]">
                {application.introduction}
              </p>
            </div>

            {application.isRecruiter && isWaiting && (
              <div className="mt-8 mb-8 flex justify-center gap-3">
                <button
                  onClick={() => handleUpdateStatus('DECLINED')}
                  disabled={isPending}
                  className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-6 py-2 text-base font-semibold text-[#E22222] transition disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-xl bg-[#5E92F0] px-6 py-2 text-base text-white transition hover:bg-[#4F84E8] disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
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
    </main>
  );
}
