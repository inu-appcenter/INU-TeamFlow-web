'use client';

import { FaBell } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function NotificationButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/notification')}
      className="fixed top-8 right-6 z-80 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white text-[#2c2c2c] transition-all duration-150 active:scale-90"
    >
      <FaBell size={18} />
    </button>
  );
}
