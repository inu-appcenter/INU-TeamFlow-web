'use client';

import { motion } from 'motion/react';

export default function CTABackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 왼쪽 위 큰 원 */}
      <motion.div
        animate={{ x: [0, -24, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-48 -left-32 h-[480px] w-[480px] rounded-full bg-[#5E92F0]/10"
      />

      {/* 오른쪽 아래 원 (마스코트 뒤) */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 16, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        className="absolute -right-24 -bottom-40 h-[420px] w-[420px] rounded-full bg-[#5E92F0]/[0.08]"
      />

      {/* 가운데 작은 원 */}
      <motion.div
        animate={{ x: [0, -14, 0], y: [0, 12, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-[20%] left-[52%] h-32 w-32 rounded-full bg-[#5E92F0]/[0.06]"
      />

      {/* 도트 패턴 (왼쪽) */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '22px 22px'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 h-full w-1/2 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(#5E92F0 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to right, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, black, transparent)',
        }}
      />
    </div>
  );
}
