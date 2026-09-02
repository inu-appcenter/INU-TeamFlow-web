// src/components/main/banner/Banner.tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TeamFlowLaunchSlide } from './slides/TeamFlowSlide';
import { MoimiSlide } from './slides/MoimiSlide';
import { AppCenterBannerSlide } from './slides/AppCenterBannerSlide';

const SLIDES = [TeamFlowLaunchSlide, AppCenterBannerSlide, MoimiSlide];
// const SLIDES = [AppCenterBannerSlide];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const CurrentSlide = SLIDES[index];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="h-full w-full"
        >
          <CurrentSlide />
        </motion.div>
      </AnimatePresence>

      {/* 인디케이터 */}
      <div className="absolute top-1/2 right-3 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}번째 배너로 이동`}
            className="cursor-pointer p-0"
          >
            <span
              className={`block w-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'h-3 bg-white/80' : 'h-1.5 bg-white/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
