// src/components/main/banner/slides/TeamFlowSlide.tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const TIPS = [
  '팀원을 찾고 있나요? 모집 게시판을 확인해보세요',
  '일정 투표로 팀원들과 시간을 빠르게 맞춰보세요',
  '캘린더에서 팀 일정을 한눈에 확인하세요',
  '내 학번으로 간편하게 로그인하고 팀 활동을 시작해보세요',
];

const getRandomIndex = (excludeIndex: number) => {
  if (TIPS.length <= 1) return 0;

  let next = Math.floor(Math.random() * TIPS.length);
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * TIPS.length);
  }
  return next;
};

export function TeamFlowLaunchSlide() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * TIPS.length)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => getRandomIndex(prev));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-white/10">
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-3xl bg-[#F6F8FA] px-6">
        <motion.div
          animate={{ x: [0, 12, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#5E92F0]/10"
        />
        <motion.div
          animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-[#5E92F0]/[0.07]"
        />
        <motion.div
          animate={{ backgroundPosition: ['0px 0px', '14px 14px'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(#5E92F0 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            maskImage: 'linear-gradient(to left, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
          }}
        />

        <div className="z-10 flex">
          <p className="truncate text-lg font-bold text-[#5E92F0] md:text-xl">
            팀 플로우
          </p>
          <p className="truncate text-lg font-bold text-[#2C2C2C] md:text-xl">
            로 팀 활동을 한 곳에서
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="z-10 truncate text-xs text-[#989898] md:text-sm"
          >
            {TIPS[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
