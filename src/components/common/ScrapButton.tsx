'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { scrap, unscrap, type ScrapType } from '@/api/scrap';

interface ScrapButtonProps {
  type: ScrapType;
  id: number;
  initialScrapped: boolean;
}

export default function ScrapButton({
  type,
  id,
  initialScrapped,
}: ScrapButtonProps) {
  const [isScrapped, setIsScrapped] = useState(initialScrapped);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsScrapped(initialScrapped);
  }, [id, initialScrapped]);

  const handleScrap = async () => {
    if (isPending) return;

    setIsPending(true);

    try {
      if (isScrapped) {
        await unscrap(type, id);
        setIsScrapped(false);
      } else {
        await scrap(type, id);
        setIsScrapped(true);
      }
    } catch (error) {
      console.error('스크랩 처리 실패:', error);
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
