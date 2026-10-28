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
// pains: 이 배지가 강조될 PAINS 인덱스
const TOOLS: {
  label: string;
  x: number;
  y: number;
  tone: keyof typeof TONE;
  pains: number[];
}[] = [
  { label: '단톡방', x: -32, y: -26, tone: 'yellow', pains: [1, 3] },
  { label: '커뮤니티', x: 30, y: -30, tone: 'pink', pains: [0] },
  { label: '공유 시트', x: -40, y: 4, tone: 'green', pains: [2] },
  { label: '캘린더 앱', x: 38, y: 0, tone: 'blue', pains: [1] },
  { label: '설문 폼', x: -28, y: 30, tone: 'pink', pains: [1] },
  { label: '클라우드 폴더', x: 26, y: 28, tone: 'yellow', pains: [2] },
  { label: '메모 앱', x: 0, y: -34, tone: 'blue', pains: [2] },
  { label: '개인 DM', x: 0, y: 34, tone: 'green', pains: [0, 3] },
];

const PAIN_START = 0.06;
const PAIN_END = 0.7;
const PAIN_W = (PAIN_END - PAIN_START) / PAINS.length;

// a→b 상승, b→c 유지(1), c→d 하강
function trapezoid(p: number, a: number, b: number, c: number, d: number) {
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p <= c) return 1;
  return (d - p) / (d - c);
}

// PainLine opacity와 같은 곡선
function lineVisibility(p: number, index: number) {
  const start = PAIN_START + index * PAIN_W;
  return trapezoid(
    p,
    start,
    start + PAIN_W * 0.35,
    start + PAIN_W * 0.65,
    start + PAIN_W
  );
}

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
  const start = PAIN_START + index * PAIN_W;
  const keys = [
    start,
    start + PAIN_W * 0.35,
    start + PAIN_W * 0.65,
    start + PAIN_W,
  ];

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
  pains,
  index,
}: {
  progress: MotionValue<number>;
  label: string;
  x: number;
  y: number;
  tone: keyof typeof TONE;
  pains: number[];
  index: number;
}) {
  // 기존: 등장 → 마지막에 중앙으로 빨려들어감
  const tx = useTransform(progress, [0.72, 0.86], [`${x}vw`, '0vw']);
  const ty = useTransform(progress, [0.72, 0.86], [`${y}vh`, '0vh']);
  const scale = useTransform(progress, [0.72, 0.86], [1, 0.2]);
  const opacity = useTransform(progress, [0.02, 0.08, 0.8, 0.86], [0, 1, 1, 0]);

  // 강조: 관련 문장이 보이는 정도 (0~1)
  const hl = useTransform(progress, (p) =>
    Math.max(0, ...pains.map((i) => lineVisibility(p, i)))
  );
  // 문장 구간 전체에서 비관련 배지를 흐리게 (문장 사이에서 깜빡이지 않도록 구간 전체 기준)
  const dim = useTransform(progress, (p) =>
    trapezoid(
      p,
      PAIN_START,
      PAIN_START + PAIN_W * 0.35,
      PAIN_END - PAIN_W * 0.35,
      PAIN_END
    )
  );

  const focusScale = useTransform(hl, (v) => 1 + v * 0.18);
  const focusOpacity = useTransform([hl, dim], ([h, d]: number[]) => {
    return 1 - Math.max(0, d - h) * 0.7;
  });
  // 강조될 때 중앙(문장) 쪽으로 살짝 당겨짐
  const fx = useTransform(hl, (v) => `${-x * 0.18 * v}vw`);
  const fy = useTransform(hl, (v) => `${-y * 0.18 * v}vh`);

  return (
    <motion.div
      style={{ x: tx, y: ty, scale, opacity, originX: 0, originY: 0 }}
      className="absolute top-1/2 left-1/2"
    >
      <motion.div
        style={{
          x: fx,
          y: fy,
          scale: focusScale,
          opacity: focusOpacity,
          originX: 0,
          originY: 0,
        }}
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
    <section id={id} ref={ref} className="relative h-[500vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {TOOLS.map((t, i) => (
          <ToolChip key={t.label} progress={scrollYProgress} index={i} {...t} />
        ))}

        <motion.p
          style={{ opacity: questionOpacity }}
          className="absolute top-[30%] text-[16px] font-semibold text-[#5E92F0]"
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
