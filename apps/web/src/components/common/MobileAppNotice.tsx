'use client';

import { useState, useSyncExternalStore } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

// 휴대폰만 대상. iPad는 Mac UA, Android 태블릿은 UA에 Mobile이 없어서 제외됨
const isPhone = () =>
  /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent);

// 미리보기용: URL에 ?mobileNotice 붙이면 데스크톱에서도 표시
const isForced = () =>
  new URLSearchParams(window.location.search).has('mobileNotice');

// 서버 렌더/hydration 땐 false, 클라이언트에선 true
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

const IMG = '/images/mobile-notice';
const LEAVE_DURATION = 550;

// 4각 반짝이
function Sparkle({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute aspect-square ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z"
        fill="#9DB9F2"
      />
    </svg>
  );
}

export default function MobileAppNotice() {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const show = isClient && !dismissed && (isForced() || isPhone());

  useLockBodyScroll(show);

  const handleContinue = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(() => setDismissed(true), LEAVE_DURATION);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[450] overflow-y-auto bg-[#E3ECFB]">
      <div className="relative h-full min-h-[640px] w-full overflow-hidden">
        {/* 배경 원 */}
        <div className="absolute top-[-3%] right-[-18%] aspect-square w-[58%] rounded-full bg-[#DBE8FF]" />
        <div className="absolute top-[52%] left-[-22%] aspect-square w-[50%] rounded-full bg-[#DBE8FF]" />
        <div className="absolute right-[-15%] bottom-[6%] aspect-square w-[40%] rounded-full bg-[#DBE8FF]" />

        {/* 일러스트 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/people.webp`}
          alt=""
          className="absolute top-[4%] left-[45%] w-[31%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/calendar.webp`}
          alt=""
          className="absolute top-[11%] left-[-2%] w-[40%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/checklist.webp`}
          alt=""
          className="absolute top-[20%] right-[-1%] w-[33%]"
        />

        {/* 반짝이: 캘린더 아래 */}
        <Sparkle className="top-[33%] left-[15%] w-[3.5%]" />
        <Sparkle className="top-[35%] left-[10%] w-[5%]" />

        {/* 반짝이: 사람 아이콘과 체크리스트 사이 */}
        <Sparkle className="top-[20%] left-[82.5%] w-[3.5%]" />
        <Sparkle className="top-[22%] left-[86.5%] w-[5%]" />

        {/* 문구 + 웹으로 계속 */}
        <div className="absolute top-[39%] left-0 flex w-full flex-col items-center px-6 text-center">
          <div className="mb-3 flex items-end justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="Moimi" className="h-10" />
            <span className="-ml-1 text-[18px] font-semibold text-[#2C2C2C]">
              는
            </span>
          </div>
          <p className="text-[20px] font-bold text-[#2C2C2C]">
            PC · 태블릿에 최적화되어 있어요
          </p>

          <p className="mt-10 text-[18px] font-bold text-[#4F80D9]">
            모바일 앱이 곧 출시 예정이에요
          </p>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="mt-2 flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-[#B0B0B0] transition-all duration-200 active:scale-95"
          >
            웹으로 계속
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>

        {/* 캐릭터 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/moa.webp`}
          alt="moa"
          className="absolute bottom-[-2%] left-1/2 w-[90%] -translate-x-1/2"
        />
      </div>
    </div>
  );
}
