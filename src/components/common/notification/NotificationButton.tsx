'use client';

import { FaBell } from 'react-icons/fa6';

export default function NotificationButton() {
  return (
    <button className="fixed top-8 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white text-[#2c2c2c]">
      <FaBell size={18} />
    </button>
  );
}
