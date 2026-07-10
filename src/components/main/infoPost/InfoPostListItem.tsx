'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { InfoPostSummaryResponse } from '@/types/infoPost';

const categoryMap = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

type InfoPostListItemProps = {
  infoPost: InfoPostSummaryResponse;
  size: 'sm' | 'lg';
};

export default function InfoPostListItem({
  infoPost,
  size,
}: InfoPostListItemProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/info-post/${infoPost.infoPostId}`)}
      className={`flex w-full cursor-pointer items-center justify-between border-b-[0.5px] border-[#D6DDE5] text-left transition-all duration-150 hover:bg-[#F8F9FA] active:scale-[0.99] ${
        size === 'sm' ? 'px-1 py-2.5' : 'px-1 py-3'
      }`}
    >
      <div className="min-w-0">
        <p
          className={`truncate font-medium text-[#2C2C2C] ${
            size === 'sm' ? 'text-sm' : 'text-base'
          }`}
        >
          [{categoryMap[infoPost.category]}] {infoPost.title}
        </p>

        <p className="mt-1 text-xs text-[#989898]">
          참조 모집글 {infoPost.recruitmentCount}개
        </p>
      </div>

      {infoPost.thumbnailUrl && (
        <Image
          src={infoPost.thumbnailUrl}
          alt=""
          width={64}
          height={48}
          className={`ml-4 shrink-0 rounded-lg object-cover ${
            size === 'sm' ? 'h-10 w-14' : 'h-12 w-16'
          }`}
        />
      )}
    </button>
  );
}
