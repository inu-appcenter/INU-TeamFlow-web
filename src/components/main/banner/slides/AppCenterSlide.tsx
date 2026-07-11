'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

export function AppCenterCreditSlide() {
  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-white/10 p-[1.5px]">
      <motion.div
        style={{ willChange: 'transform' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute inset-[-200%] z-0 bg-[conic-gradient(from_0deg,transparent_70%,#9b28ff_85%,#b07bff_95%,#ffffff_100%)]"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-3xl bg-black px-8">
        <Image
          src="/images/app-center-logo.png"
          alt="App Center 로고"
          width={65}
          height={65}
          className="ml-[-14px] hidden h-auto max-h-[60%] w-auto shrink-0 lg:block"
        />

        <div className="flex min-w-0 flex-col justify-center gap-1">
          <p className="truncate text-base font-semibold text-white">
            TeamFlow는 인천대학교 IT동아리
          </p>
          <div className="flex items-center gap-1.5">
            <Image
              src="/images/app-center-wordmark.png"
              alt="APP CENTER 이름"
              width={200}
              height={80}
              className="h-[50%] w-auto lg:h-auto lg:w-auto"
            />
            <span className="truncate text-base font-semibold text-white">
              에서 제작되었습니다
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
