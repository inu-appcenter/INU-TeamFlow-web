'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    label: '홈',
    title: '내 팀 활동을 한눈에',
    desc: '참여 중인 팀, 다가오는 일정, 새 소식을 메인에서 바로 확인해요',
    srcs: ['/images/landing/showcase/home.png'],
  },
  {
    label: '팀원 모집',
    title: '필요한 팀원은 모집 게시판에서',
    desc: '공모전, 프로젝트, 스터디까지 모집하고 지원서를 한곳에서 관리하세요',
    srcs: ['/images/landing/showcase/recruit.png'],
  },
  {
    label: '일정 · 투표',
    title: '되는 시간은 투표로 바로',
    desc: '단톡방 뒤질 필요 없이 일정 조율과 확정을 한 번에 끝내요',
    srcs: [
      '/images/landing/showcase/schedule.png',
      '/images/landing/showcase/vote.png',
    ],
  },
  {
    label: '채팅',
    title: '팀별 실시간 채팅',
    desc: '팀 채팅방에서 바로 대화하고, 누가 읽었는지도 확인해요',
    srcs: ['/images/landing/showcase/chat.png'],
  },
  {
    label: '공지',
    title: '중요한 공지는 묻히지 않게',
    desc: '팀 공지와 교내 정보 게시판으로 놓치는 소식 없이',
    srcs: [
      '/images/landing/showcase/notice.png',
      '/images/landing/showcase/notice-detail.png',
    ],
  },
];

const DURATION = 5;

// 이미지 2장일 때: 47%까지 첫 장 유지 → 59%까지 전환 → 끝까지 두 번째 장
const SWAP_TIMES = [0, 0.47, 0.59, 1];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '12%' : '-12%',
    opacity: 0,
    filter: 'blur(8px)',
  }),
  center: { x: '0%', opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({
    x: dir > 0 ? '-12%' : '12%',
    opacity: 0,
    filter: 'blur(8px)',
  }),
};

function SlideImages({ srcs, label }: { srcs: string[]; label: string }) {
  const sizes = '(min-width: 1152px) 1100px, 100vw';

  if (srcs.length === 1) {
    return (
      <Image
        src={srcs[0]}
        alt={`모이미 ${label} 화면`}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    );
  }

  const [first, second] = srcs;
  const swap = {
    duration: DURATION,
    times: SWAP_TIMES,
    ease: 'easeInOut' as const,
  };

  return (
    <>
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ['0%', '0%', '-8%', '-8%'],
          opacity: [1, 1, 0, 0],
          filter: ['blur(0px)', 'blur(0px)', 'blur(8px)', 'blur(8px)'],
        }}
        transition={swap}
      >
        <Image
          src={first}
          alt={`모이미 ${label} 화면 1`}
          fill
          sizes={sizes}
          className="object-cover object-top"
        />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          x: ['8%', '8%', '0%', '0%'],
          opacity: [0, 0, 1, 1],
          filter: ['blur(8px)', 'blur(8px)', 'blur(0px)', 'blur(0px)'],
        }}
        transition={swap}
      >
        <Image
          src={second}
          alt={`모이미 ${label} 화면 2`}
          fill
          sizes={sizes}
          className="object-cover object-top"
        />
      </motion.div>
    </>
  );
}

export default function Showcase({ id }: { id?: string }) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);

  const go = (next: number, dir: number) => {
    setSlide([(next + SLIDES.length) % SLIDES.length, dir]);
  };

  const current = SLIDES[index];

  return (
    <section id={id} className="scroll-mt-20 bg-white py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-[#2C2C2C]">
                {current.title}
              </h2>
              <p className="mt-3 text-lg text-[#818893]">{current.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 브라우저 프레임 + 슬라이드 */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border-[0.5px] border-[#D6DDE5]/60 bg-white shadow-[0_24px_60px_-30px_rgba(44,44,44,0.25)]">
            <div className="flex items-center gap-2 border-b-[0.5px] border-[#D6DDE5]/60 bg-white px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              <div className="ml-4 flex-1 rounded-full bg-[#F0F2F5] px-4 py-1.5 text-xs text-[#989898]">
                moimi.appcenter.kr
              </div>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden bg-[#F0F2F5]">
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <SlideImages srcs={current.srcs} label={current.label} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* 좌우 화살표 */}
          <button
            type="button"
            onClick={() => go(index - 1, -1)}
            aria-label="이전 화면"
            className="absolute top-1/2 -left-5 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5]/60 bg-white text-[#2C2C2C]/60 shadow-sm transition hover:text-[#2C2C2C] active:scale-90"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1, 1)}
            aria-label="다음 화면"
            className="absolute top-1/2 -right-5 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5]/60 bg-white text-[#2C2C2C]/60 shadow-sm transition hover:text-[#2C2C2C] active:scale-90"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 탭 + 진행 바 */}
        <div className="mt-8 grid grid-cols-5 gap-3">
          {SLIDES.map((s, i) => {
            const active = i === index;
            const parts = s.srcs.length;

            return (
              <button
                key={s.label}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                className="group cursor-pointer text-left"
              >
                <div className="flex gap-1">
                  {Array.from({ length: parts }, (_, p) => (
                    <div
                      key={p}
                      className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#D6DDE5]/60"
                    >
                      {active && (
                        <motion.div
                          key={index}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: DURATION / parts,
                            delay: (DURATION / parts) * p,
                            ease: 'linear',
                          }}
                          onAnimationComplete={
                            p === parts - 1 ? () => go(index + 1, 1) : undefined
                          }
                          className="h-full origin-left bg-[#5E92F0]"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p
                  className={`mt-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-[#2C2C2C]'
                      : 'text-[#B0B8C1] group-hover:text-[#818893]'
                  }`}
                >
                  {s.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
