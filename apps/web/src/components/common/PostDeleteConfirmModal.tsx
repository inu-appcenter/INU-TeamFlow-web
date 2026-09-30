'use client';

import type { PostDeleteConfirmModalProps } from '@moimi/core/types/postDeleteConfirm';

export default function PostDeleteConfirmModal({
  postLabel,
  isPending = false,
  onClose,
  onConfirm,
}: PostDeleteConfirmModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-delete-title"
      >
        <h2
          id="post-delete-title"
          className="text-center text-xl font-bold text-[#2C2C2C]"
        >
          {postLabel}을 삭제할까요?
        </h2>
        <p className="mt-2 text-center text-[15px] text-[#989898]">
          삭제한 {postLabel}은 복구할 수 없어요
        </p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-3 font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
