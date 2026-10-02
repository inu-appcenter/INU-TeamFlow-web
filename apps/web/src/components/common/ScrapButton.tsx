'use client';

import { useState } from 'react';
import axios from 'axios';
import { Bookmark } from 'lucide-react';
import { scrap, unscrap, type ScrapType } from '@moimi/core/api/scrap';

interface ScrapButtonProps {
  type: ScrapType;
  id: number;
  initialScrapped: boolean;
  // false를 반환하면 스크랩하지 않음 (예: 학교 인증 체크)
  onBeforeToggle?: () => boolean;
}

export default function ScrapButton({
  type,
  id,
  initialScrapped,
  onBeforeToggle,
}: ScrapButtonProps) {
  const [isScrapped, setIsScrapped] = useState(initialScrapped);
  const [isPending, setIsPending] = useState(false);

  const handleScrap = async () => {
    if (isPending) return;

    // 스크랩할 때만 체크 (취소는 허용)
    if (!isScrapped && onBeforeToggle && !onBeforeToggle()) return;

    const nextScrapped = !isScrapped;

    setIsPending(true);

    try {
      if (isScrapped) {
        await unscrap(type, id);
      } else {
        await scrap(type, id);
      }

      setIsScrapped(nextScrapped);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsScrapped(nextScrapped);
        return;
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleScrap}
      disabled={isPending}
      aria-label={isScrapped ? '스크랩 취소' : '스크랩'}
      className="cursor-pointer text-[#2C2C2C] disabled:cursor-default"
    >
      <Bookmark
        size={22}
        strokeWidth={2}
        fill={isScrapped ? 'currentColor' : 'none'}
        className={isScrapped ? 'text-[#5E92F0]' : ''}
      />
    </button>
  );
}
