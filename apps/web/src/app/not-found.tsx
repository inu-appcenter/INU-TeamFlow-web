'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import { circulat } from '@/fonts/logoFonts';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-3 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full max-w-[440px] flex-col items-center text-center"
      >
        <span
          className={`${circulat.className} -mt-4 text-[48px]`}
          style={{ color: '#5E92F0' }}
        >
          Moimi
        </span>

        <svg
          width="180"
          height="166"
          viewBox="0 0 240 220"
          fill="none"
          aria-hidden="true"
          className="mt-0"
        >
          <ellipse
            cx="120"
            cy="196"
            rx="70"
            ry="10"
            fill="#2C2C2C"
            opacity="0.04"
          />

          <circle cx="200" cy="46" r="10" fill="#C5DFFF" />
          <circle cx="26" cy="70" r="7" fill="#D5E9FF" />
          <rect
            x="196"
            y="130"
            width="16"
            height="16"
            rx="5"
            transform="rotate(18 196 130)"
            fill="#C5DFFF"
          />
          <circle cx="18" cy="150" r="5" fill="#5E92F0" opacity="0.5" />

          <path
            d="M120 168C120 168 96 148 96 118"
            stroke="#D6DDE5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 9"
          />

          <path
            d="M56 60C56 45.64 67.64 34 82 34H158C172.36 34 184 45.64 184 60V104C184 118.36 172.36 130 158 130H108L82 152V130H82C67.64 130 56 118.36 56 104V60Z"
            fill="#D5E9FF"
          />

          <g stroke="#2558B5" strokeWidth="4" strokeLinecap="round">
            <path d="M94 74L106 86" />
            <path d="M106 74L94 86" />
            <path d="M134 74L146 86" />
            <path d="M146 74L134 86" />
          </g>
          <path
            d="M104 104C112 96 128 96 136 104"
            stroke="#2558B5"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <p className="mt-3 text-[22px] font-semibold tracking-[0.14em] text-[#5E92F0]">
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
            className="group flex cursor-pointer items-center gap-1.5 pr-4 text-[15px] font-semibold"
          >
            <span className="relative">
              <span className="text-[#b0b0b0]">홈으로 돌아가기</span>
              <span className="absolute inset-0 overflow-hidden text-[#5E92F0] transition-[clip-path] duration-300 ease-out [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]">
                홈으로 돌아가기
              </span>
            </span>

            <span className="grid w-0 shrink-0 place-items-center overflow-hidden opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100">
              <ChevronRight
                size={17}
                strokeWidth={3}
                className="text-[#5E92F0]"
              />
            </span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
