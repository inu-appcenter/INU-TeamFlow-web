'use client';

import { useRouter } from 'next/navigation';
import type { RecruitmentSummaryResponse } from '@/types/recruitment';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

type RecruitmentListItemProps = {
  recruitment: RecruitmentSummaryResponse;
  size: 'sm' | 'lg';
};

export default function RecruitmentListItem({
  recruitment,
  size,
}: RecruitmentListItemProps) {
  const router = useRouter();
  const isLg = size === 'lg';

  return (
    <button
      type="button"
      onClick={() => router.push(`/recruitment/${recruitment.recruitmentId}`)}
      className={`z-50 flex w-full cursor-pointer flex-col justify-center border-b-[0.5px] border-[#D6DDE5] text-left last:border-b-0 active:scale-[0.99] ${
        isLg ? 'h-[76px]' : 'h-[68px]'
      }`}
    >
      <h3
        className={`truncate font-semibold text-[#2C2C2C] ${
          isLg ? 'text-[17px]' : 'text-[15px]'
        }`}
      >
        [ {categoryMap[recruitment.category]} ] {recruitment.title}
      </h3>

      <p
        className={`mt-1 truncate text-xs ${
          recruitment.announcementTitle ? 'text-[#2C2C2C]' : 'text-[#B0B0B0]'
        }`}
      >
        {recruitment.announcementTitle || '연결된 정보글이 없습니다'}
      </p>
    </button>
  );
}
