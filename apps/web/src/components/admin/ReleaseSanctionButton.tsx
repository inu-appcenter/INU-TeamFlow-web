'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { isAxiosError } from 'axios';
import { useReleaseReportSanction } from '@/hooks/admin/useSuspendedUsers';

type Props = {
  reportId: number;
  targetName: string;
  size?: 'sm' | 'md';
  className?: string;
  onReleased?: () => void;
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? '해제에 실패했어요.';
  }
  return '해제에 실패했어요.';
};

export default function ReleaseSanctionButton({
  reportId,
  targetName,
  size = 'md',
  className = '',
  onReleased,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending, error, reset } = useReleaseReportSanction();

  const close = () => {
    if (isPending) return;
    setIsOpen(false);
    reset();
  };

  const handleRelease = () => {
    mutate(reportId, {
      onSuccess: () => {
        setIsOpen(false);
        onReleased?.();
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer border-[0.5px] border-[#D6DDE5] bg-[#5E92F0]/10 font-semibold text-[#5E92F0] transition hover:bg-[#5E92F0]/15 ${
          size === 'sm'
            ? 'rounded-lg px-3 py-1.5 text-xs'
            : 'rounded-xl py-2.5 text-sm'
        } ${className}`}
      >
        정지 해제
      </button>

      {isOpen &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
                정지를 해제할까요?
              </h2>

              <p className="mt-2 text-center text-[14px] text-[#989898]">
                {targetName}님의 계정이 복구되고 해제 알림이 발송돼요
              </p>

              {error && (
                <p className="mt-2 text-center text-[13px] font-medium text-[#B32424]">
                  {getErrorMessage(error)}
                </p>
              )}

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={isPending}
                  className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={handleRelease}
                  disabled={isPending}
                  className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 font-semibold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? '해제 중...' : '해제'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
