'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';

import Card from '@/components/main/Card';
import { useRecruitmentDetail } from '@/hooks/useRecruitmentQuery';
import { useSchoolVerificationGuard } from '@/hooks/useSchoolVerificationGuard';
import { formatDate } from '@/utils/date/formatDate';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

export default function RecruitmentDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const recruitmentId = Number(params.id);

  const { data: recruitment, isLoading } = useRecruitmentDetail(recruitmentId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState(() =>
    searchParams.get('error') === 'school-verification-required'
      ? '학교 인증 후 이용 가능합니다'
      : ''
  );
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 1800);
  };
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

  const getDDay = (endAt: string) => {
    const today = new Date();
    const endDate = new Date(endAt);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diff = endDate.getTime() - today.getTime();
    const day = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (day > 0) return `D-${day}`;
    if (day === 0) return 'D-Day';

    return `D+${Math.abs(day)}`;
  };

  const isClosed =
    new Date(recruitment.endAt) < new Date() || recruitment.status === 'CLOSED';

  const isRecruiter = recruitment.isRecruiter;

  const isDisabled = isRecruiter || recruitment.hasApplied || isClosed;

  const handleDeleteRecruitment = async () => {
    // 삭제 api 되면할거임
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
                      onClick={handleDeleteRecruitment}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
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
                  {getDDay(recruitment.endAt)}
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

            <div className="mt-6 flex justify-center">
              <button
                disabled={isDisabled}
                onClick={() => {
                  if (!checkVerified()) return;
                  router.push(`/recruitment/${recruitmentId}/apply`);
                }}
                className={`rounded-xl px-5 py-2 text-[14px] transition sm:px-6 sm:text-base ${
                  isDisabled
                    ? 'cursor-not-allowed bg-[#EEF1F5] text-[#989898]'
                    : 'cursor-pointer bg-[#5E92F0] text-white hover:bg-[#5C86EB]'
                }`}
              >
                {isRecruiter
                  ? '내가 쓴 글'
                  : recruitment.hasApplied
                    ? '지원 완료'
                    : isClosed
                      ? '모집 마감'
                      : '지원하기'}
              </button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
