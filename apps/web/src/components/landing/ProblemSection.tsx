'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

const PAINS = [
  { lead: '팀원은', text: '커뮤니티 글로 구하고' },
  { lead: '일정은', text: '단톡방 투표로 맞추고' },
  { lead: '자료는', text: '여기저기 폴더에 흩어지고' },
  { lead: '공지는', text: '대화 속에 묻혀버리고' },
];

// 서비스 카테고리 태그와 같은 파스텔 톤
const TONE = {
  blue: 'bg-[#DCE6FA] text-[#4A6FB5]',
  pink: 'bg-[#F6E1F5] text-[#A0559A]',
  green: 'bg-[#DDF5DD] text-[#3F7F45]',
  yellow: 'bg-[#FFF0C8] text-[#9A7420]',
} as const;

// x: vw, y: vh (화면 중앙 기준)
const TOOLS: {
  label: string;
  x: number;
  y: number;
  tone: keyof typeof TONE;
}[] = [
  { label: '단톡방', x: -36, y: -28, tone: 'yellow' },
  { label: '커뮤니티', x: 32, y: -32, tone: 'pink' },
  { label: '공유 시트', x: -40, y: 6, tone: 'green' },
  { label: '캘린더 앱', x: 38, y: 2, tone: 'blue' },
  { label: '설문 폼', x: -28, y: 34, tone: 'pink' },
  { label: '클라우드 폴더', x: 26, y: 32, tone: 'yellow' },
  { label: '메모 앱', x: -4, y: -40, tone: 'blue' },
  { label: '개인 DM', x: 6, y: 40, tone: 'green' },
];

const PAIN_START = 0.06;
const PAIN_END = 0.7;

function PainLine({
  progress,
  index,
  lead,
  text,
}: {
  progress: MotionValue<number>;
  index: number;
  lead: string;
  text: string;
}) {
  const w = (PAIN_END - PAIN_START) / PAINS.length;
  const start = PAIN_START + index * w;
  const keys = [start, start + w * 0.35, start + w * 0.65, start + w];

  const rotateX = useTransform(progress, keys, [75, 0, 0, -75]);
  const y = useTransform(progress, keys, [110, 0, 0, -110]);
  const opacity = useTransform(progress, keys, [0, 1, 1, 0]);

  return (
    <motion.p
      style={{ rotateX, y, opacity }}
      className="absolute w-full px-6 text-center text-4xl font-bold md:text-6xl"
    >
      <span className="text-[#B0B8C1]">{lead} </span>
      <span className="text-[#2C2C2C]">{text}</span>
    </motion.p>
  );
}

function ToolChip({
  progress,
  label,

  x,
  y,
  tone,
  index,
}: {
  progress: MotionValue<number>;
  label: string;
  x: number;
  y: number;
  tone: keyof typeof TONE;
  index: number;
}) {
  const tx = useTransform(progress, [0.72, 0.86], [`${x}vw`, '0vw']);
  const ty = useTransform(progress, [0.72, 0.86], [`${y}vh`, '0vh']);
  const scale = useTransform(progress, [0.72, 0.86], [1, 0.2]);
  const opacity = useTransform(progress, [0.02, 0.08, 0.8, 0.86], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ x: tx, y: ty, scale, opacity }}
      className="absolute top-1/2 left-1/2"
    >
      <motion.span
        animate={{ y: [0, index % 2 ? 8 : -8, 0] }}
        transition={{
          duration: 4 + (index % 3),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl shadow-[0_8px_24px_-12px_rgba(44,44,44,0.2)]"
      >
        <span
          className={`rounded-full px-4 py-1.5 text-[15px] font-semibold whitespace-nowrap ${TONE[tone]}`}
        >
          {label}
        </span>
      </motion.span>
    </motion.div>
  );
}

export default function ProblemSection({ id }: { id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const questionOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.68, 0.72],
    [0, 1, 1, 0]
  );
  const finalOpacity = useTransform(scrollYProgress, [0.84, 0.92], [0, 1]);
  const finalScale = useTransform(scrollYProgress, [0.84, 0.92], [0.9, 1]);
  const glowScale = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]);
  const underline = useTransform(scrollYProgress, [0.9, 0.97], [0, 1]);

  return (
    <section id={id} ref={ref} className="relative h-[500vh] bg-[#F0F2F5]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {TOOLS.map((t, i) => (
          <ToolChip key={t.label} progress={scrollYProgress} index={i} {...t} />
        ))}

        <motion.p
          style={{ opacity: questionOpacity }}
          className="absolute top-[22%] text-[16px] font-semibold text-[#5E92F0]"
        >
          지금 팀플, 이렇지 않나요?
        </motion.p>

        <div
          className="relative flex h-40 w-full items-center justify-center"
          style={{ perspective: 900, transformStyle: 'preserve-3d' }}
        >
          {PAINS.map((p, i) => (
            <PainLine
              key={p.lead}
              progress={scrollYProgress}
              index={i}
              {...p}
            />
          ))}
        </div>

        <motion.div
          aria-hidden
          style={{ scale: glowScale }}
          className="absolute h-[560px] w-[560px] rounded-full bg-[#DCE6FA] blur-3xl"
        />
        <motion.div
          style={{ opacity: finalOpacity, scale: finalScale }}
          className="absolute px-6 text-center"
        >
          <p className="mb-4 text-xl font-semibold text-[#818893]">
            흩어진 팀플
          </p>
          <h2 className="text-5xl font-bold text-[#2C2C2C] md:text-7xl">
            이제{' '}
            <span className="relative inline-block text-[#5E92F0]">
              모이미
              <motion.span
                style={{ scaleX: underline }}
                className="absolute inset-x-0 -bottom-2 h-[5px] origin-left rounded-full bg-[#5E92F0]"
              />
            </span>{' '}
            하나로
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
