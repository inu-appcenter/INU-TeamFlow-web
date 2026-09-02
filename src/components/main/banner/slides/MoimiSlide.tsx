'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

export function MoimiSlide() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      <Image
        src="/images/banner1.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex h-full w-full flex-col justify-center gap-3 px-12"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-[#2c2c2c]">
            함께라서 더 쉬워지는
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#2c2c2c]">우리의</p>
            <p className="text-2xl font-bold text-[#5E92F0]">캠퍼스 라이프, </p>
            <p className="text-2xl font-bold text-[#2c2c2c]">지금</p>
            <div className="flex items-center">
              <span className="relative inline-block text-2xl font-bold text-[#5E92F0]">
                모이미
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                  className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-[#5E92F0]"
                />
              </span>
              <p className="text-2xl font-bold text-[#2c2c2c]">에서!</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
