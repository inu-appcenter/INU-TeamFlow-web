'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

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
    desc: '공모전, 프로젝트, 스터디까지 모집하고\n지원서를 한곳에서 관리하세요',
    srcs: ['/images/landing/showcase/recruit.png'],
  },
  {
    label: '일정·투표',
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
const SWAP_TIMES = [0, 0.47, 0.59, 1];
// 이 거리(px) 이상 밀면 다음/이전 슬라이드로
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '8%' : '-8%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-8%' : '8%', opacity: 0 }),
};

function SlideImages({ srcs, label }: { srcs: string[]; label: string }) {
  const sizes = '(min-width: 480px) 480px, 100vw';
  // 드래그 이벤트가 부모(motion.div)로 가도록 이미지는 포인터 이벤트 끔
  const imgClass = 'pointer-events-none object-cover object-top select-none';

  if (srcs.length === 1) {
    return (
      <Image
        src={srcs[0]}
        alt={`모이미 ${label} 화면`}
        fill
        sizes={sizes}
        className={imgClass}
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
        animate={{ x: ['0%', '0%', '-6%', '-6%'], opacity: [1, 1, 0, 0] }}
        transition={swap}
      >
        <Image
          src={first}
          alt={`모이미 ${label} 화면 1`}
          fill
          sizes={sizes}
          className={imgClass}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ x: ['6%', '6%', '0%', '0%'], opacity: [0, 0, 1, 1] }}
        transition={swap}
      >
        <Image
          src={second}
          alt={`모이미 ${label} 화면 2`}
          fill
          sizes={sizes}
          className={imgClass}
        />
      </motion.div>
    </>
  );
}

export default function MobileShowcase({ id }: { id?: string }) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);

  const go = (next: number, dir: number) => {
    setSlide([(next + SLIDES.length) % SLIDES.length, dir]);
  };

  const current = SLIDES[index];

  return (
    <section id={id} className="bg-white px-5 pt-10 pb-20">
      <p className="text-center text-[14px] font-semibold text-[#5E92F0]">
        PC에서는 이렇게 써요
      </p>

      {/* 제목: 설명 길이가 달라도 아래가 들썩이지 않게 높이 고정 */}
      <div className="mt-6 min-h-[92px] text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#2C2C2C]">
              {current.title}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed break-keep whitespace-pre-line text-[#818893]">
              {current.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 브라우저 프레임 + 슬라이드 (좌우 스와이프) */}
      <div className="mt-4 overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white shadow-[0_20px_40px_-24px_rgba(44,44,44,0.3)]">
        <div className="flex items-center gap-1.5 border-b-[0.5px] border-[#D6DDE5]/60 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
          <span className="h-2 w-2 rounded-full bg-[#28C840]" />
          <div className="ml-2 flex-1 rounded-full bg-[#F0F2F5] px-3 py-0.5 text-[10px] text-[#989898]">
            moimi.appcenter.kr
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-[#F0F2F5]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1, 1);
                else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1, -1);
              }}
              className="absolute inset-0 touch-pan-y overflow-hidden"
            >
              <SlideImages srcs={current.srcs} label={current.label} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 탭 + 진행 바 */}
      <div className="mt-6 mb-12 grid grid-cols-5 gap-2">
        {SLIDES.map((s, i) => {
          const active = i === index;
          const parts = s.srcs.length;

          return (
            <button
              key={s.label}
              type="button"
              onClick={() => go(i, i > index ? 1 : -1)}
              className="text-center"
            >
              <div className="flex gap-0.5">
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
                className={`mt-2 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-[#2C2C2C]' : 'text-[#B0B8C1]'
                }`}
              >
                {s.label}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
