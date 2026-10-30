'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, Check, Copy } from 'lucide-react';
import {
  MobileHeroBackground,
  MobileCTABackground,
} from './_components/Mobilebackgrounds';
import MobileProblem from './_components/MobileProblem';
import MobileShowcase from './_components/MobileShowcase';

// ⚠️ 운영 도메인으로 수정
const SITE_URL = 'moimi.inuappcenter.kr';

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-[64%] max-w-[260px] rounded-[2.2rem] bg-[#F5F5F5] p-[4px] shadow-2xl">
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[calc(2.2rem-4px)] bg-white">
        <div className="absolute top-2 left-1/2 z-10 h-[16px] w-[64px] -translate-x-1/2 rounded-full bg-gray-300" />
        <Image
          src="/images/landing/hero-mobile.webp"
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

function ScrollHint({
  containerRef,
  targetId,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  targetId: string;
}) {
  const { scrollY } = useScroll({ container: containerRef });
  const opacity = useTransform(scrollY, [40, 200], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.button
        type="button"
        onClick={() =>
          document
            .getElementById(targetId)
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-medium whitespace-nowrap text-[#989898] shadow-[0_8px_30px_rgba(0,0,0,0.08)] active:scale-95"
      >
        스크롤해서 확인하세요
        <span className="relative inline-flex h-[15px] w-[15px] overflow-hidden">
          <motion.span
            animate={{ y: [-15, 0, 0, 15], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              times: [0, 0.35, 0.65, 1],
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-flex"
          >
            <ArrowDown size={15} strokeWidth={2} />
          </motion.span>
        </span>
      </motion.button>
    </motion.div>
  );
}

function CopyUrlButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없으면 무시 (주소는 화면에 보이니까)
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5E92F0] py-3 text-[14px] font-semibold text-white transition-transform duration-150 active:scale-95"
    >
      {copied ? (
        <>
          <Check size={18} strokeWidth={2.5} />
          주소를 복사했어요
        </>
      ) : (
        <>
          <Copy size={17} strokeWidth={2.2} />
          PC 접속 주소 복사하기
        </>
      )}
    </button>
  );
}

export default function MobileNoticePage() {
  // body에 min-width(700px)가 걸려 있어서 fixed 컨테이너 안에서 스크롤함
  const containerRef = useRef<HTMLElement>(null);

  return (
    <main
      ref={containerRef}
      className="fixed inset-0 overflow-x-hidden overflow-y-auto bg-white text-gray-900"
    >
      <div className="mx-auto max-w-[480px]">
        {/* Header */}
        {/* Header: 고정 없이 히어로 위에 투명하게 겹침 (-mb-14로 자리 차지 안 함) */}
        <header className="relative z-50 -mb-14 flex h-14 items-center px-6 pt-2">
          <Image
            src="/images/logo.svg"
            alt="Moimi 로고"
            width={6477}
            height={2184}
            priority
            unoptimized
            className="h-auto w-[88px]"
          />
        </header>

        {/* Hero: 헤더 포함 화면 전체 높이 (헤더는 위에 투명하게 겹침) */}
        <section className="relative flex min-h-svh flex-col overflow-hidden pt-24">
          <MobileHeroBackground />

          <FadeIn className="relative z-10 px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5E92F0]/10 px-3 py-1 text-[12px] font-semibold text-[#5E92F0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5E92F0]" />
              모바일 앱 출시 예정
            </span>
            <h1 className="mt-6 text-[28px] leading-[1.3] font-bold tracking-[-0.03em] text-[#191F28]">
              팀플의 시작부터 끝까지
              <br />
              이제 <span className="text-[#5E92F0]">모이미</span> 하나로
            </h1>
            <p className="mt-6 text-[14px] leading-[1.7] tracking-[-0.01em] text-[#989898]">
              팀원 구하기부터 공지 남기기까지
              <br />
              흩어져 있던 걸 한 곳에 모았어요
            </p>
          </FadeIn>

          {/* 폰 목업: 남은 높이를 전부 차지하고, 아래쪽은 잘리면서 흐려지게 */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative z-10 mt-10 min-h-[240px] flex-1 basis-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_65%,transparent)] pt-2"
          >
            <PhoneMockup />
          </motion.div>

          <ScrollHint containerRef={containerRef} targetId="problem" />
        </section>

        {/* 문제 제기 → 모이미 */}
        <MobileProblem id="problem" containerRef={containerRef} />

        {/* 웹 화면 캐러셀 */}
        <MobileShowcase id="features" />

        {/* Bottom: 모바일 웹 안내 */}
        <section className="relative overflow-hidden bg-[#E9EFFB]">
          <MobileCTABackground />

          <div className="relative flex flex-col items-center px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative z-10 mb-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -3, 0, 3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src="/images/mascot.webp"
                  alt=""
                  width={320}
                  height={320}
                  className="h-auto w-[140px] drop-shadow-[0_16px_24px_rgba(94,146,240,0.25)]"
                />
              </motion.div>
            </motion.div>

            <FadeIn className="relative z-10 w-full">
              <p className="text-[16px] font-semibold text-[#2C2C2C]">
                함께라서 더 쉬워지는
              </p>
              <h2 className="mt-2 text-[26px] leading-snug font-bold tracking-[-0.01em] text-[#2C2C2C]">
                지금 바로{' '}
                <span className="relative inline-block text-[#5E92F0]">
                  모이미
                </span>
                에서
                <br />
                팀을 모아보세요
              </h2>

              {/* 안내 카드 */}
              <div className="mt-10 rounded-2xl bg-white/80 px-5 py-6 shadow-[0_12px_32px_-16px_rgba(94,146,240,0.35)] backdrop-blur">
                <p className="text-[18px] font-bold text-[#2C2C2C]">
                  모바일 앱은 곧 출시 예정이에요
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#989898]">
                  모바일 웹에서는 모이미를 이용할 수 없어요
                  <br />
                  PC 또는 태블릿으로 접속해 주세요
                </p>

                <CopyUrlButton />
              </div>
            </FadeIn>
          </div>
        </section>

        <footer className="py-2 text-center text-[12px] text-[#B0B8C1]">
          © {new Date().getFullYear()} INU App Center. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
