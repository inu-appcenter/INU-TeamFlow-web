'use client';

import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDepartmentName } from '@/utils/getDepartmentName';

import Card from '@/components/main/Card';
import { applyRecruitment } from '@/api/recruitment';
import { useRecruitmentDetail } from '@/hooks/useRecruitmentQuery';
import { useMyInfo } from '@/hooks/useAuthQuery';

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

export default function RecruitmentApplyPage() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);

  const { data: recruitment, isLoading } = useRecruitmentDetail(recruitmentId);

  const [introduction, setIntroduction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: myInfo } = useMyInfo();

  if (isLoading) return null;
  if (!recruitment) return null;

  const handleSubmit = async () => {
    if (!introduction.trim()) {
      alert('지원서를 작성해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      await applyRecruitment(recruitmentId, {
        introduction,
      });

      alert('지원이 완료되었습니다.');
      router.push(`/recruitment/${recruitmentId}`);
    } catch {
      alert('지원에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
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
          </div>

          <div className="px-14 py-10 sm:px-16 sm:py-12">
            <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
              {recruitment.title}
            </h1>
            <div className="mt-8 grid grid-cols-[70px_1fr] gap-y-6 text-[15px]">
              <span className="text-[#989898]">이름</span>
              <span className="font-semibold">{myInfo?.name ?? '-'}</span>
              <span className="text-[#989898]">학과</span>
              <span className="font-semibold">
                {myInfo ? getDepartmentName(myInfo.department) : '-'}
              </span>
              <span className="text-[#989898]">학번</span>
              <span className="font-semibold">
                {myInfo?.studentNumber ?? '-'}
              </span>
            </div>
            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5] sm:mt-8" />
            <div className="mt-8">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] font-semibold text-[#2c2c2c]">
                  지원서를 작성해주세요
                </span>
                <span className="text-[14px] font-medium text-[#b0b0b0]">
                  Tip. 경험이나 목표를 함께 적으면 더 좋아요, 너무 짧은 지원서는
                  승인받기 어려울 수 있어요
                </span>
              </div>

              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder=""
                className="thin-scrollbar mt-4 h-[220px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] p-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
              />
            </div>
            <div className="mt-7 border-b-[0.5px] border-[#D6DDE5] sm:mt-8" />
            <div className="mt-8 mb-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-[#5E92F0] px-6 py-2 text-base text-white transition hover:bg-[#4F84E8] disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    지원하기
                  </span>
                ) : (
                  '지원하기'
                )}
              </button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
