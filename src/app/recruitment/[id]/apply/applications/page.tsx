'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/main/Card';
import {
  useRecruitmentDetail,
  useRecruitmentApplications,
} from '@/hooks/useRecruitmentQuery';
import { formatDate } from '@/utils/date/formatDate';
import { categoryColorMap } from '@/constants/category';
import type { ApplicationStatus } from '@/types/recruitment';

const statusLabelMap: Record<ApplicationStatus, string> = {
  WAITING: '대기중',
  ACCEPTED: '수락',
  DECLINED: '거절',
  CANCELLED: '취소됨',
};

const statusColorMap: Record<ApplicationStatus, string> = {
  WAITING: 'bg-[#EEF1F5] text-[#5E92F0]',
  ACCEPTED: 'bg-[#A7ECA7] text-[#1F4D1A]',
  DECLINED: 'bg-[#FFD3D3] text-[#B32424]',
  CANCELLED: 'bg-[#EEF1F5] text-[#989898]',
};

export default function RecruitmentApplications() {
  const router = useRouter();
  const params = useParams();
  const recruitmentId = Number(params.id);
  const [page, setPage] = useState(1);
  const { data: recruitment } = useRecruitmentDetail(recruitmentId);
  const { data, isLoading } = useRecruitmentApplications(
    recruitmentId,
    page - 1,
    10
  );
  const applications = data?.content ?? [];

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-16 items-center gap-4 px-6 sm:h-18"
            style={{
              backgroundColor: recruitment
                ? (categoryColorMap[recruitment.category] ?? '#E9E9E9')
                : '#E9E9E9',
            }}
          >
            <button
              onClick={() => router.push(`/recruitment/${recruitmentId}`)}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="sm:h-7 sm:w-7"
              />
            </button>
            <h1 className="text-[22px] font-bold text-[#2C2C2C]">
              지원자 목록
            </h1>
          </div>

          <div className="px-6 py-4 sm:py-4">
            <div className="mt-2 flex items-center gap-2 text-[13px] text-[#989898]">
              <span>총 지원자 수 :</span>{' '}
              {data && <span>{data.totalElements}</span>}
            </div>

            {isLoading ? (
              <p className="mt-8 text-center text-sm text-[#989898]">
                불러오는 중...
              </p>
            ) : applications.length === 0 ? (
              <p className="mt-8 text-center text-sm text-[#989898]">
                아직 지원자가 없습니다
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {applications.map((application) => (
                  <li key={application.applicationId}>
                    <button
                      onClick={() =>
                        router.push(
                          `/recruitment/${recruitmentId}/apply/applications/${application.applicationId}`
                        )
                      }
                      className="w-full cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]/60 px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-xl px-3 py-1 text-[11px] font-medium sm:text-sm ${statusColorMap[application.applicationStatus]}`}
                        >
                          {statusLabelMap[application.applicationStatus]}
                        </span>
                        <span className="font-semibold text-[#2C2C2C]">
                          {application.applicantName}
                        </span>
                      </div>
                      <span className="flex items-center justify-between">
                        <p className="mt-1 line-clamp-1 text-[13px] text-[#989898] sm:text-sm">
                          {application.introduction}
                        </p>

                        <p className="mt-1 text-[11px] text-[#B0B0B0] sm:text-xs">
                          {formatDate(application.createdAt)}
                        </p>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* 페이지네이션 */}
            {data && data.totalPages > 0 && (
              <div className="mt-8 mb-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
                >
                  <ChevronLeft size={22} strokeWidth={2.5} />
                </button>

                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`flex items-center justify-center px-1 text-[16px] font-semibold transition-all duration-150 active:scale-90 ${
                        page === n
                          ? 'text-[#5E92F0]'
                          : 'cursor-pointer text-[#2c2c2c]/50'
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                  className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
                >
                  <ChevronRight size={22} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
