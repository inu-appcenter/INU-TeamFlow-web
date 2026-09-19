'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Monitor } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const STORAGE_KEY = 'desktopRecommendDismissed';
const EXCLUDED_PATHS = ['/policy'];

export default function DesktopRecommendModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (isExcluded) return;

    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {}

    const isNarrow = window.matchMedia('(max-width: 639px)').matches;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 체크
    if (isNarrow && !dismissed) setOpen(true);
  }, [isExcluded]);

  useLockBodyScroll(open && !isExcluded);

  const handleClose = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setOpen(false);
  };

  if (!open || isExcluded) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/30 px-6">
      <div className="animate-modal-pop w-full max-w-sm rounded-2xl bg-white px-6 pt-8 pb-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#EEF3FE] text-[#5E92F0]">
          <Monitor size={24} />
        </div>

        <h2 className="mb-2 text-[18px] font-bold text-[#2C2C2C]">
          큰 화면에서 보시는 걸 추천해요
        </h2>

        <p className="mb-4 text-[14px] leading-6 text-[#989898]">
          모이미는 PC나 태블릿 같은 큰 화면에서
          <br />더 편하게 이용할 수 있어요
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="w-full cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95"
        >
          확인
        </button>
      </div>
    </div>
  );
}
