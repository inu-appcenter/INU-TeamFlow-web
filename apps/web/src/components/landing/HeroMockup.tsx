'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

const WEB_SRC = '/images/landing/hero-web.png';
const MOBILE_SRC = '/images/landing/hero-mobile.webp';

function BrowserFrame() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400">
          moimi.appcenter.kr
        </div>
      </div>
      {/* 화면 */}
      <div className="relative aspect-[16/10] bg-[#F0F2F5]">
        <Image
          src={WEB_SRC}
          alt="모이미 웹 화면"
          fill
          priority
          sizes="(min-width: 768px) 800px, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function PhoneFrame() {
  return (
    <div className="rounded-[2.4rem] bg-gray-900 p-[7px] shadow-2xl">
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-white">
        {/* 노치 */}
        <div className="absolute top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-gray-900" />
        <Image
          src={MOBILE_SRC}
          alt="모이미 앱 화면"
          fill
          priority
          sizes="260px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

export default function HeroMockup() {
  return (
    <div className="relative pr-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <BrowserFrame />
      </motion.div>

      <motion.div
        className="absolute right-0 bottom-0 w-[33%] min-w-[160px]"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      >
        <PhoneFrame />
      </motion.div>
    </div>
  );
}
