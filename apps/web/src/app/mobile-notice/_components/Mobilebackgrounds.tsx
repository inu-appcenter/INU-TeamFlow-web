'use client';

import { motion } from 'motion/react';

// 웹 배경은 원 크기가 px 고정(560px 등)이라 폰에선 원 하나가 화면을 덮어버림
// → 모바일은 화면 폭 기준(%)으로 크기를 잡고, 움직임 폭도 줄임

const DOT_STYLE = {
  backgroundImage: 'radial-gradient(#5E92F0 1.2px, transparent 1.2px)',
  backgroundSize: '18px 18px',
};

function Circle({
  className,
  x,
  y,
  duration,
  delay = 0,
}: {
  className: string;
  x: number;
  y: number;
  duration: number;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ x: [0, x, 0], y: [0, y, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`absolute aspect-square rounded-full ${className}`}
    />
  );
}

export function MobileHeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#EEF3FD] via-white to-white"
    >
      {/* 오른쪽 위: 제목 뒤로 살짝 걸치게 */}
      <Circle
        className="-top-[8%] -right-[28%] w-[78%] bg-[#5E92F0]/[0.09]"
        x={-12}
        y={10}
        duration={12}
      />

      {/* 왼쪽: 폰 목업 옆 */}
      <Circle
        className="top-[42%] -left-[30%] w-[60%] bg-[#5E92F0]/[0.07]"
        x={10}
        y={-8}
        duration={14}
        delay={0.5}
      />

      {/* 오른쪽 아래 작은 원 */}
      <Circle
        className="top-[62%] -right-[6%] w-[24%] bg-[#5E92F0]/[0.06]"
        x={-6}
        y={8}
        duration={10}
        delay={1}
      />

      {/* 도트: 위쪽 가운데에만 은은하게 */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '18px 18px'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-x-0 top-0 h-[55%] opacity-[0.22]"
        style={{
          ...DOT_STYLE,
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)',
        }}
      />
    </div>
  );
}

const NOTICE_IMG = '/images/mobile-notice';

// 4각 반짝이 (기존 mobile-notice에서 가져옴)
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

// 고정 일러스트
function Illust({ src, className }: { src: string; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`absolute h-auto ${className}`} />
  );
}

export function MobileCTABackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 왼쪽 위 */}
      <Circle
        className="-top-[10%] -left-[32%] w-[80%] bg-[#5E92F0]/10"
        x={10}
        y={-8}
        duration={12}
      />

      {/* 오른쪽 아래: 안내 카드 뒤 */}
      <Circle
        className="-right-[30%] -bottom-[8%] w-[75%] bg-[#5E92F0]/[0.08]"
        x={-10}
        y={8}
        duration={14}
        delay={0.5}
      />

      {/* 마스코트 뒤 은은한 빛 */}
      <div className="absolute top-[4%] left-1/2 aspect-square w-[70%] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      {/* 일러스트: 지그재그 배치 (오른쪽 위 → 왼쪽 → 오른쪽 제목 옆) */}
      <Illust
        src={`${NOTICE_IMG}/people.webp`}
        className="top-[3%] right-[5%] w-[24%]"
      />
      <Illust
        src={`${NOTICE_IMG}/calendar.webp`}
        className="top-[20%] w-[25%]"
      />
      <Illust
        src={`${NOTICE_IMG}/checklist.webp`}
        className="top-[35%] -right-[5%] w-[25%]"
      />

      {/* 도트: 위쪽에만 */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '18px 18px'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-x-0 top-0 h-[45%] opacity-[0.2]"
        style={{
          ...DOT_STYLE,
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />
    </div>
  );
}
