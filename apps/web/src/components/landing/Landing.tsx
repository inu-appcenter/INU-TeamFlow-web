'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import HeroMockup from './HeroMockup';
import HeroBackground from './HeroBackground';
import ScrollHint from './ScrollHint';
import ProblemSection from './ProblemSection';
import Showcase from './Showcase';
import CTABackground from './CTABackground';

const LOGIN_PATH = '/login';

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StartButton({ size = 'md' }: { size?: 'md' | 'lg' }) {
  if (size === 'lg') {
    return (
      <Link
        href={LOGIN_PATH}
        className="group inline-flex w-[220px] items-center justify-center rounded-xl bg-[#5E92F0] py-4 text-lg font-semibold text-white transition-all duration-150 active:scale-95"
      >
        <span className="inline-flex items-center justify-center">
          모이미 시작하기
          <span className="ml-0 inline-flex w-0 items-center justify-center overflow-hidden opacity-0 transition-all duration-200 group-hover:ml-1.5 group-hover:w-4 group-hover:opacity-100">
            <ChevronRight
              size={21}
              className="-mr-2 shrink-0"
              strokeWidth={2.5}
            />
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={LOGIN_PATH}
      className="group inline-flex items-center text-sm font-semibold"
    >
      <span className="relative">
        <span className="text-[#2c2c2c]/50">로그인</span>
        <span className="absolute inset-0 overflow-hidden text-[#2c2c2c] transition-[clip-path] duration-300 ease-out [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]">
          로그인
        </span>
      </span>
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen min-w-[1280px] bg-white text-gray-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b-[0.5px] border-[#D6DDE5] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
          <Image
            src="/images/logo.svg"
            alt="Moimi 로고"
            width={6477}
            height={2184}
            priority
            unoptimized
            className="mt-0 h-auto w-[125px]"
          />
          <StartButton />
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <HeroBackground />

        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-12 px-6 md:grid-cols-[1fr_1.7fr]">
          <FadeIn>
            <p className="mb-4 text-[18px] font-semibold tracking-[3.0px] text-[#5E92F0]">
              대학생 팀 활동 플랫폼
            </p>
            <h1 className="mb-6 text-5xl font-bold">
              팀플의{' '}
              <span className="relative isolate inline-block">
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-10 h-[0.2em] origin-left rounded-sm bg-[#5E92F0]/25"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.7,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                />
                시작부터 끝까지
              </span>
              <br />
              <span className="text-[#5E92F0]">모이미</span>에서
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-[#818893]">
              팀원 모집, 일정 조율, 채팅, 공지까지
              <br />
              웹에서도, 앱에서도 한곳에서
            </p>
            <StartButton size="lg" />
          </FadeIn>

          <HeroMockup />
        </div>

        <ScrollHint targetId="problem" />
      </section>

      {/* 문제 제기 → 모이미 */}
      <ProblemSection id="problem" />

      {/* 웹 화면 캐러셀 */}
      <Showcase id="features" />

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-[#E9EFFB]">
        <CTABackground />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          {/* 마스코트 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="relative z-10 mb-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -3, 0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/mascot.webp"
                alt=""
                width={320}
                height={320}
                className="h-auto w-[160px] drop-shadow-[0_16px_24px_rgba(94,146,240,0.25)]"
              />
            </motion.div>
          </motion.div>

          <FadeIn className="relative z-10">
            <p className="text-xl font-bold text-[#2C2C2C]">
              함께라서 더 쉬워지는
            </p>
            <h2 className="mt-2 text-4xl leading-snug font-bold text-[#2C2C2C]">
              지금 바로{' '}
              <span className="relative inline-block text-[#5E92F0]">
                모이미
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.5,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                  className="absolute inset-x-0 -bottom-0 h-[4px] origin-left rounded-full bg-[#5E92F0]"
                />
              </span>
              에서 팀을 모아보세요
            </h2>
            <p className="mt-4 text-[#818893]">
              모바일 앱도 곧 출시될 예정이에요
            </p>
            <div className="mt-8 flex justify-center">
              <StartButton size="lg" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[#B0B8C1]">
        © {new Date().getFullYear()} INU App Center. All rights reserved.
      </footer>
    </div>
  );
}
