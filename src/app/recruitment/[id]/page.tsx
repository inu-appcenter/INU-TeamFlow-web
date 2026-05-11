'use client';

import { useParams, useRouter } from 'next/navigation';

import { ChevronLeft, Ellipsis } from 'lucide-react';

import Card from '@/components/main/Card';
import { recruitmentDetails } from '@/mocks/recruitmentDetail';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const statusMap: Record<string, string> = {
  OPEN: '모집중',
  CLOSED: '모집마감',
};

export default function RecruitmentDetail() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);

  const recruitment = recruitmentDetails.find(
    (item) => item.recruitmentId === recruitmentId
  );

  if (!recruitment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-lg font-semibold text-[#2C2C2C]">
          존재하지 않는 게시글입니다.
        </p>
      </main>
    );
  }

  const isOpen = recruitment.status === 'OPEN';

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

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-6 pt-6">
      <section className="mx-auto mt-12 max-w-3xl">
        <Card className="overflow-hidden rounded-b-none p-0">
          <div className="flex h-18 items-center justify-between bg-[#D6DDE5] px-6">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <button className="cursor-pointer text-[#2C2C2C]">
              <Ellipsis size={22} />
            </button>
          </div>

          <div className="px-10 py-10">
            <h1 className="text-3xl font-bold text-[#2C2C2C]">
              {recruitment.title}
            </h1>

            {hasAnnouncement ? (
              <button className="mt-4 cursor-pointer rounded-xl bg-[#EEF1F5] px-4 py-1.5 text-sm text-[#2C2C2C] transition hover:bg-[#E3E7EB]">
                &lt;{recruitment.announcementTitle}&gt; 바로가기
              </button>
            ) : (
              <button
                disabled
                className="mt-4 cursor-not-allowed rounded-xl bg-[#EEF1F5] px-4 py-1.5 text-sm text-[#989898]"
              >
                연결된 정보글이 없습니다
              </button>
            )}

            <div className="mt-8 grid grid-cols-[90px_1fr] gap-y-5 text-sm">
              <span className="text-[#989898]">종류</span>
              <span className="text-[#2C2C2C]">
                {categoryMap[recruitment.category]}
              </span>

              <span className="text-[#989898]">모집현황</span>
              <div>
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                    isOpen
                      ? 'bg-[#A7ECA7] text-[#1F4D1A]'
                      : 'bg-[#F67F8F] text-[#ffffff]'
                  }`}
                >
                  {statusMap[recruitment.status]}
                </span>
              </div>

              <span className="text-[#989898]">모집마감</span>
              <div className="flex items-center gap-2">
                <p className="text-[#2c2c2c]">
                  {recruitment.createdAt} ~ {recruitment.endAt}
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

            <div className="mt-8 border-b border-[#D6DDE5]" />

            <section className="mt-6">
              <h2 className="text-sm text-[#989898]">상세요강</h2>

              <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-[#2C2C2C]">
                {recruitment.description}
              </p>
            </section>

            <div className="mt-20 border-b border-[#D6DDE5]" />

            <div className="mt-6 flex justify-center">
              <button className="cursor-pointer rounded-xl bg-[#5E92F0] px-6 py-2 text-base text-white transition hover:bg-[#5C86EB]">
                지원하기
              </button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
