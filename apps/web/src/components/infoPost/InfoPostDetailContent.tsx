import { infoPostCategoryMap } from '@moimi/core/constants/infoPost';
import { formatDate } from '@/utils/date/formatDate';
import type { InfoPostDetailContentProps } from '@moimi/core/types/infoPostDetail';

export default function InfoPostDetailContent({
  infoPost,
}: InfoPostDetailContentProps) {
  return (
    <div className="px-8 py-7 sm:px-10 sm:py-10">
      <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
        {infoPost.title}
      </h1>
      <div className="mt-7 grid grid-cols-[72px_1fr] items-center gap-y-4 text-[13px] sm:mt-8 sm:grid-cols-[90px_1fr] sm:gap-y-5 sm:text-[15px]">
        <span className="text-[#989898]">종류</span>
        <span className="text-[#2C2C2C]">
          {infoPostCategoryMap[infoPost.category]}
        </span>
        <span className="text-[#989898]">작성자</span>
        <span className="text-[#2C2C2C]">{infoPost.author.name}</span>
        <span className="text-[#989898]">작성일</span>
        <span className="text-[#2C2C2C]">{formatDate(infoPost.createdAt)}</span>
        <span className="text-[#989898]">모집글</span>
        <span className="text-[#2C2C2C]">
          연결된 모집글 {infoPost.recruitmentCount ?? 0}개
        </span>
        {infoPost.sourceUrl && (
          <>
            <span className="text-[#989898]">원문 링크</span>
            <a
              href={infoPost.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[#5E92F0] underline underline-offset-2 hover:text-[#4C82E5]"
            >
              {infoPost.sourceUrl}
            </a>
          </>
        )}
      </div>
      <div className="mt-8 border-b-[0.5px] border-[#D6DDE5]" />
      <p className="mt-6 text-[15px] leading-8 whitespace-pre-wrap text-[#2C2C2C]">
        {infoPost.content}
      </p>
      {infoPost.images.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {[...infoPost.images]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${image.imageUrl}-${image.sortOrder}`}
                src={image.imageUrl}
                alt=""
                className="max-h-[500px] w-full rounded-xl object-contain"
              />
            ))}
        </div>
      )}
    </div>
  );
}
