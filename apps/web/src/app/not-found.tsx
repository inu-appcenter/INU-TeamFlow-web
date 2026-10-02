'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-3 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full max-w-[440px] flex-col items-center text-center"
      >
        <div className="relative -ml-3 flex flex-col items-center">
          <Image
            src="/images/404.webp"
            alt="모이미 캐릭터"
            width={140}
            height={100}
            priority
          />
          <div
            className="absolute bottom-0 left-1/2 -z-10 h-[12px] w-[80px] -translate-x-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(44,44,44,0.16) 0%, rgba(44,44,44,0) 72%)',
            }}
          />
        </div>

        <p className="mt-3 text-[26px] font-semibold tracking-[0.14em] text-[#5E92F0]">
          404
        </p>
        <h1 className="mt-2 text-xl font-bold text-[#2C2C2C]">
          어라, 이곳은 존재하지 않는 페이지예요.
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[#989898]">
          입력하신 주소를 다시 확인해주세요.
          <br />
        </p>

        <div className="mt-7 flex items-center">
          <Link
            href="/main"
            className="group flex cursor-pointer items-center gap-1.5 text-[15px] font-semibold"
          >
            <span className="relative">
              <span className="text-[#b0b0b0]">홈으로 돌아가기</span>
              <span className="absolute inset-0 overflow-hidden text-[#2c2c2c] transition-[clip-path] duration-300 ease-out [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]">
                홈으로 돌아가기
              </span>
            </span>

            <span className="-mt-0.5 grid w-0 shrink-0 place-items-center overflow-hidden opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100">
              <ChevronRight
                size={17}
                strokeWidth={3}
                className="text-[#2c2c2c]"
              />
            </span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
