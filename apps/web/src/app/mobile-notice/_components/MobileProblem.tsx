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

const TONE = {
  blue: 'bg-[#DCE6FA] text-[#4A6FB5]',
  pink: 'bg-[#F6E1F5] text-[#A0559A]',
  green: 'bg-[#DDF5DD] text-[#3F7F45]',
  yellow: 'bg-[#FFF0C8] text-[#9A7420]',
} as const;

// 모바일용 배치: 가운데 문장 영역(±12vh)을 피해서 위/아래로 배치
// x: vw, y: vh (화면 중앙 기준)
const TOOLS: {
  label: string;
  x: number;
  y: number;
  tone: keyof typeof TONE;
  pains: number[];
}[] = [
  { label: '메모 앱', x: 0, y: -35, tone: 'blue', pains: [2] },
  { label: '단톡방', x: -26, y: -27, tone: 'yellow', pains: [1, 3] },
  { label: '커뮤니티', x: 26, y: -27, tone: 'pink', pains: [0] },
  { label: '공유 시트', x: -26, y: 17, tone: 'green', pains: [2] },
  { label: '캘린더 앱', x: 26, y: 17, tone: 'blue', pains: [1] },
  { label: '설문 폼', x: -22, y: 28, tone: 'pink', pains: [1] },
  { label: '클라우드 폴더', x: 20, y: 28, tone: 'yellow', pains: [2] },
  { label: '개인 DM', x: 0, y: 37, tone: 'green', pains: [0, 3] },
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
  const y = useTransform(progress, keys, [80, 0, 0, -80]);
  const opacity = useTransform(progress, keys, [0, 1, 1, 0]);

  return (
    <motion.p
      style={{ rotateX, y, opacity }}
      className="absolute w-full px-6 text-center text-[28px] leading-snug font-bold tracking-[-0.02em]"
    >
      <span className="block text-[#B0B8C1]">{lead}</span>
      <span className="block text-[#2C2C2C]">{text}</span>
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
  const tx = useTransform(progress, [0.72, 0.86], [`${x}vw`, '0vw']);
  const ty = useTransform(progress, [0.72, 0.86], [`${y}vh`, '0vh']);
  const scale = useTransform(progress, [0.72, 0.86], [1, 0.2]);
  const opacity = useTransform(progress, [0.02, 0.08, 0.8, 0.86], [0, 1, 1, 0]);

  const hl = useTransform(progress, (p) =>
    Math.max(0, ...pains.map((i) => lineVisibility(p, i)))
  );
  const dim = useTransform(progress, (p) =>
    trapezoid(
      p,
      PAIN_START,
      PAIN_START + PAIN_W * 0.35,
      PAIN_END - PAIN_W * 0.35,
      PAIN_END
    )
  );

  const focusScale = useTransform(hl, (v) => 1 + v * 0.15);
  const focusOpacity = useTransform([hl, dim], ([h, d]: number[]) => {
    return 1 - Math.max(0, d - h) * 0.7;
  });
  const fx = useTransform(hl, (v) => `${-x * 0.12 * v}vw`);
  const fy = useTransform(hl, (v) => `${-y * 0.12 * v}vh`);

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
          animate={{ y: [0, index % 2 ? 6 : -6, 0] }}
          transition={{
            duration: 4 + (index % 3),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl shadow-[0_8px_24px_-12px_rgba(44,44,44,0.2)]"
        >
          <span
            className={`rounded-full px-3 py-1 text-[13px] font-semibold whitespace-nowrap ${TONE[tone]}`}
          >
            {label}
          </span>
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export default function MobileProblem({
  id,
  containerRef,
}: {
  id?: string;
  // 페이지가 fixed 스크롤 컨테이너 안에서 스크롤되므로 컨테이너를 넘겨받음
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
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
    <section id={id} ref={ref} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        {TOOLS.map((t, i) => (
          <ToolChip key={t.label} progress={scrollYProgress} index={i} {...t} />
        ))}

        <motion.p
          style={{ opacity: questionOpacity }}
          className="absolute top-[36%] text-[15px] font-semibold text-[#5E92F0]"
        >
          지금 팀플, 이렇지 않나요?
        </motion.p>

        <div
          className="relative flex h-28 w-full items-center justify-center"
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
          className="absolute h-[360px] w-[360px] rounded-full bg-[#DCE6FA] blur-3xl"
        />
        <motion.div
          style={{ opacity: finalOpacity, scale: finalScale }}
          className="absolute px-6 text-center"
        >
          <p className="mb-3 text-[16px] font-semibold text-[#818893]">
            흩어진 팀플
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.03em] text-[#2C2C2C]">
            이제{' '}
            <span className="relative inline-block text-[#5E92F0]">
              모이미
              <motion.span
                style={{ scaleX: underline }}
                className="absolute inset-x-0 -bottom-[0.1px] h-[4px] origin-left rounded-full bg-[#5E92F0]"
              />
            </span>{' '}
            하나로
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
