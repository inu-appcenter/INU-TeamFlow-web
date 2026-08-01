'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { infoPostCategoryMap } from '@/constants/infoPost';
import type { InfoPostSummaryResponse } from '@/types/infoPost';

type InfoPostListItemProps = {
  infoPost: InfoPostSummaryResponse;
  size: 'sm' | 'lg';
};

export default function InfoPostListItem({
  infoPost,
  size,
}: InfoPostListItemProps) {
  const router = useRouter();
  const isLg = size === 'lg';

  return (
    <button
      type="button"
      onClick={() => router.push(`/infoPost/${infoPost.infoPostId}`)}
      className={`z-50 flex w-full cursor-pointer items-center justify-between border-b-[0.5px] border-[#D6DDE5] text-left last:border-b-0 active:scale-[0.99] ${
        isLg ? 'h-[76px]' : 'h-[68px]'
      }`}
    >
      <div className="min-w-0">
        <h3
          className={`truncate font-semibold text-[#2C2C2C] ${
            isLg ? 'text-[17px]' : 'text-[15px]'
          }`}
        >
          [ {infoPostCategoryMap[infoPost.category]} ] {infoPost.title}
        </h3>

        <p className="mt-1 truncate text-xs text-[#989898]">
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
            isLg ? 'h-12 w-16' : 'h-10 w-14'
          }`}
        />
      )}
    </button>
  );
}
