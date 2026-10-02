'use client';

import { useEffect, useRef } from 'react';

type Props = {
  permission: 'default' | 'denied' | 'setup-required';
  isPending: boolean;
  error: string;
  onAllow: () => void;
  onClose: () => void;
};

export default function FcmPermissionNotice({
  permission,
  isPending,
  error,
  onAllow,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();

    return () => {
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcm-permission-title"
        aria-describedby="fcm-permission-description"
        tabIndex={-1}
        className="animate-modal-pop w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isPending) onClose();
          if (event.key !== 'Tab') return;

          const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              'button:not(:disabled)'
            )
          );

          if (!buttons.length) {
            event.preventDefault();
            return;
          }

          const first = buttons[0];
          const last = buttons[buttons.length - 1];

          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === event.currentTarget)
          ) {
            event.preventDefault();
            last.focus();
          } else if (
            !event.shiftKey &&
            (document.activeElement === last ||
              document.activeElement === event.currentTarget)
          ) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <h2
          id="fcm-permission-title"
          className="text-center text-xl font-bold text-[#2C2C2C]"
        >
          {permission === 'setup-required'
            ? '알림 설정을 확인해주세요'
            : permission === 'denied'
              ? '브라우저 알림이 차단되어 있어요'
              : '브라우저 알림을 허용해주세요'}
        </h2>

        <p
          id="fcm-permission-description"
          className="mt-3 text-center text-[14px] leading-6 text-[#989898]"
        >
          {permission === 'setup-required'
            ? '회원가입은 완료됐지만 알림 설정을 저장하지 못했어요. 마이페이지의 설정에서 받고 싶은 알림을 확인하고 완료를 눌러주세요.'
            : permission === 'denied'
              ? '모이미의 알림 설정은 켜져 있어요. 브라우저의 사이트 설정에서 알림을 허용한 뒤 돌아오면 다시 확인할게요.'
              : '모이미의 알림 설정은 켜져 있어요. 이 브라우저에서도 알림을 받으려면 권한을 허용해주세요.'}
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-[#E22222]">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 text-sm font-semibold disabled:opacity-50"
          >
            {permission === 'default' ? '나중에' : '확인'}
          </button>

          {permission === 'default' && (
            <button
              type="button"
              onClick={onAllow}
              disabled={isPending}
              className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending ? '확인 중...' : '알림 허용'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
