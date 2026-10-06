'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown } from 'lucide-react';

export default function ScrollHint({ targetId }: { targetId: string }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [200, 400], [0.8, 0]);

  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.button
        type="button"
        onClick={handleClick}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="group flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-[#989898] shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-transform duration-150 active:scale-95"
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
            className="inline-flex text-[#989898] transition-colors group-hover:text-[#5E92F0]"
          >
            <ArrowDown size={15} strokeWidth={2} />
          </motion.span>
        </span>
      </motion.button>
    </motion.div>
  );
}
