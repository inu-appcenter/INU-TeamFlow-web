'use client';

import { useState } from 'react';
import { ChevronLeft, EllipsisVertical } from 'lucide-react';
import { infoPostCategoryColorMap } from '@moimi/core/constants/infoPost';
import ScrapButton from '@/components/common/ScrapButton';
import type { InfoPostDetailActionsProps } from '@moimi/core/types/infoPostDetail';

export default function InfoPostDetailActions({
  infoPost,
  isDeleting,
  onBack,
  onEdit,
  onDelete,
  onReport,
}: InfoPostDetailActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);

  return (
    <div
      className="flex h-18 items-center justify-between px-6"
      style={{ backgroundColor: infoPostCategoryColorMap[infoPost.category] }}
    >
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[#2C2C2C]"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <div className="flex items-center gap-3">
        {infoPost.isAuthor ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="cursor-pointer pt-1.5 text-[#2C2C2C]"
            >
              <EllipsisVertical size={20} />
            </button>
            {isMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute top-7 right-0 z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                  >
                    수정하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete();
                    }}
                    disabled={isDeleting}
                    className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#E22222] transition hover:bg-[#F6F8FA] disabled:opacity-50"
                  >
                    삭제하기
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <ScrapButton
              type="infoPost"
              id={infoPost.infoPostId}
              initialScrapped={infoPost.isScrap}
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReportMenuOpen((prev) => !prev)}
                className="cursor-pointer pt-1.5 text-[#2C2C2C]"
              >
                <EllipsisVertical size={20} />
              </button>
              {isReportMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="메뉴 닫기"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsReportMenuOpen(false)}
                  />
                  <div className="absolute top-7 right-0 z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportMenuOpen(false);
                        onReport();
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#E22222] transition hover:bg-[#F6F8FA]"
                    >
                      신고하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
