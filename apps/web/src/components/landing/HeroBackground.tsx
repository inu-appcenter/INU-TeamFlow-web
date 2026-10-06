'use client';

import { motion } from 'motion/react';

export default function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 오른쪽 위 큰 원 */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -right-32 h-[560px] w-[560px] rounded-full bg-[#5E92F0]/10"
      />

      {/* 왼쪽 아래 원 */}
      <motion.div
        animate={{ x: [0, -24, 0], y: [0, 20, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        className="absolute -bottom-48 -left-40 h-[460px] w-[460px] rounded-full bg-[#5E92F0]/[0.07]"
      />

      {/* 가운데 작은 원 */}
      <motion.div
        animate={{ x: [0, 16, 0], y: [0, 14, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-[18%] left-[38%] h-40 w-40 rounded-full bg-[#5E92F0]/[0.06]"
      />

      {/* 도트 패턴 */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '22px 22px'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 right-0 h-full w-1/2 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(#5E92F0 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to left, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
        }}
      />
    </div>
  );
}
