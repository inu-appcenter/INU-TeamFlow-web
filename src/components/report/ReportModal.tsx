'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

// ---- 타입 (관리자 신고 페이지의 ReportReason과 동일하게 맞춰주세요) ----
export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'FRAUD' | 'ETC';

export const REPORT_REASON_MAP: Record<ReportReason, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FRAUD: '사기/허위정보',
  ETC: '기타',
};

const REASON_OPTIONS = (Object.keys(REPORT_REASON_MAP) as ReportReason[]).map(
  (value) => ({
    value,
    label: REPORT_REASON_MAP[value],
  })
);

type ReportModalProps = {
  targetLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    reason: ReportReason;
    content: string;
  }) => void | Promise<void>;
};

export default function ReportModal({
  targetLabel,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [content, setContent] = useState('');

  const selectedLabel = reason
    ? REPORT_REASON_MAP[reason]
    : '신고 유형을 선택해주세요';

  const isSubmitDisabled = !reason || !content.trim() || isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitDisabled || !reason) return;
    await onSubmit({ reason, content: content.trim() });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
          {targetLabel} 신고하기
        </h2>
        <p className="mt-1 text-center text-sm text-[#989898]">
          신고 사유를 알려주시면 검토 후 조치할게요
        </p>

        <div className="relative mt-5">
          <div className="mb-2 text-xs font-medium text-[#B0B0B0]">
            신고 유형
          </div>
          <button
            type="button"
            onClick={() => setIsReasonOpen((prev) => !prev)}
            className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-left text-sm transition focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
          >
            <span className={reason ? 'text-[#2C2C2C]' : 'text-[#9C9C9C]'}>
              {selectedLabel}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-[#9C9C9C] transition-transform duration-200 ${
                isReasonOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isReasonOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsReasonOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute top-[74px] left-0 z-20 w-full origin-top rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-[2px_2px_15px_0px_rgba(149,157,165,0.20)]"
                >
                  {REASON_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setReason(option.value);
                        setIsReasonOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm transition hover:bg-[#F6F8FA] ${
                        reason === option.value ? 'bg-[#EEF1F5]' : ''
                      }`}
                    >
                      <span className="text-[#2C2C2C]">{option.label}</span>
                      {reason === option.value && (
                        <Check size={16} className="text-[#5E92F0]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-[#B0B0B0]">
            신고 내용
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="신고 사유를 자세히 적어주세요"
            className="thin-scrollbar w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
          />
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] py-2.5 text-sm font-semibold text-[#2C2C2C] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition ${
              isSubmitDisabled
                ? 'cursor-not-allowed bg-[#EEF1F5] text-[#9C9C9C]'
                : 'bg-[#E22222] hover:bg-[#CC1F1F]'
            }`}
          >
            {isSubmitting ? '접수 중...' : '신고하기'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
