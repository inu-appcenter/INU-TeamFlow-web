'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

export function AppCenterBannerSlide() {
  return (
    <Link
      href="https://home.inuappcenter.kr/"
      target="_blank"
      rel="noopener noreferrer"
      className="relative block h-full w-full overflow-hidden rounded-3xl bg-white/10 p-[1.5px]"
    >
      <motion.div
        style={{ willChange: 'transform' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute inset-[-200%] z-0 bg-[conic-gradient(from_0deg,transparent_70%,#9b28ff_85%,#b07bff_95%,#ffffff_100%)]"
      />

      <div className="relative z-10 h-full w-full overflow-hidden rounded-3xl">
        <Image
          src="/images/banner2.png"
          alt="모이미는 인천대학교 앱센터에서 만들어졌습니다"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </Link>
  );
}
