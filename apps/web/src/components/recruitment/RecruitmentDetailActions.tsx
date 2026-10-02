'use client';

import { useState } from 'react';
import { ChevronLeft, EllipsisVertical } from 'lucide-react';
import { categoryColorMap } from '@moimi/core/constants/category';
import ScrapButton from '@/components/common/ScrapButton';
import type { RecruitmentDetailActionsProps } from '@moimi/core/types/recruitmentDetail';

export default function RecruitmentDetailActions({
  category,
  recruitmentId,
  isRecruiter,
  isClosed,
  isDeleting,
  isScrap,
  onBack,
  onEdit,
  onDelete,
  onReport,
  onBeforeScrap,
}: RecruitmentDetailActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);

  return (
    <div
      className="flex h-18 items-center justify-between px-6"
      style={{ backgroundColor: categoryColorMap[category] ?? '#E9E9E9' }}
    >
      <button onClick={onBack} className="cursor-pointer text-[#2C2C2C]">
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <div className="flex items-center gap-3">
        {isRecruiter ? (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="cursor-pointer pt-1.5 text-[#2C2C2C]"
            >
              <EllipsisVertical size={20} />
            </button>
            {isMenuOpen && (
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
                        onEdit();
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                    >
                      수정하기
                    </button>
                  )}
                  <button
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
              type="recruitment"
              id={recruitmentId}
              initialScrapped={isScrap}
              onBeforeToggle={onBeforeScrap}
            />
            <div className="relative">
              <button
                onClick={() => setIsReportMenuOpen((prev) => !prev)}
                className="cursor-pointer pt-1.5 text-[#2C2C2C]"
              >
                <EllipsisVertical size={20} />
              </button>
              {isReportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsReportMenuOpen(false)}
                  />
                  <div className="absolute top-6 right-[-10px] z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                    <button
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
