'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Users,
  CalendarCheck,
  MessageCircle,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
import HeroMockup from './HeroMockup';
import Image from 'next/image';

const LOGIN_PATH = '/login';

const FEATURES = [
  {
    icon: Users,
    title: '팀원 모집',
    desc: '공모전, 프로젝트, 스터디까지.\n필요한 팀원을 모집하고 지원서를 한곳에서 관리하세요.',
  },
  {
    icon: CalendarCheck,
    title: '일정 · 투표',
    desc: '모두 되는 시간 찾느라 단톡방 뒤질 필요 없이,\n일정 조율과 투표를 바로 끝내세요.',
  },
  {
    icon: MessageCircle,
    title: '실시간 채팅',
    desc: '팀별 채팅방에서 바로 대화하고,\n누가 읽었는지도 확인할 수 있어요.',
  },
  {
    icon: Megaphone,
    title: '공지 · 정보 게시판',
    desc: '중요한 공지는 묻히지 않게,\n교내 정보는 놓치지 않게.',
  },
];

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
        <span className="text-[#5E92F0]/50">로그인</span>
        <span className="absolute inset-0 overflow-hidden text-[#5E92F0] transition-[clip-path] duration-300 ease-out [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]">
          로그인
        </span>
      </span>
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b-[0.5px] border-[#D6DDE5] bg-[#F0F2F5]/80 backdrop-blur">
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
      <section className="flex min-h-screen items-center pt-16">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 md:grid-cols-[1fr_1.5fr]">
          <FadeIn>
            <p className="mb-4 text-sm font-semibold text-gray-500">
              대학생 팀 협업 플랫폼
            </p>
            <h1 className="mb-6 text-5xl leading-tight font-bold">
              팀플의 시작부터 끝까지,
              <br />
              모이미에서
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-gray-600">
              팀원 모집, 일정 조율, 채팅, 공지까지.
              <br />
              웹에서도, 앱에서도 한곳에서.
            </p>
            <StartButton size="lg" />
          </FadeIn>

          <HeroMockup />
        </div>
      </section>

      {/* Features */}
      {FEATURES.map(({ icon: Icon, title, desc }, i) => {
        const reversed = i % 2 === 1;
        return (
          <section
            key={title}
            className={reversed ? 'bg-[#F7F8FA] py-32' : 'bg-white py-32'}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2">
              <FadeIn className={reversed ? 'md:order-2' : ''}>
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon size={28} />
                </div>
                <h2 className="mb-4 text-4xl font-bold">{title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-line text-gray-600">
                  {desc}
                </p>
              </FadeIn>

              <FadeIn delay={0.15} className={reversed ? 'md:order-1' : ''}>
                {/* ⚠️ 기능별 스크린샷으로 교체 */}
                <div className="aspect-[4/3] w-full rounded-3xl bg-gray-200 shadow-lg" />
              </FadeIn>
            </div>
          </section>
        );
      })}

      {/* Bottom CTA */}
      <section className="bg-black py-32 text-center text-white">
        <FadeIn>
          <h2 className="mb-4 text-4xl font-bold">지금 바로 팀을 모아보세요</h2>
          <p className="mb-10 text-gray-400">
            모바일 앱도 곧 출시될 예정이에요.
          </p>
          <Link
            href={LOGIN_PATH}
            className="inline-flex rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition hover:opacity-80"
          >
            모이미 시작하기
          </Link>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} INU App Center. All rights reserved.
      </footer>
    </div>
  );
}
