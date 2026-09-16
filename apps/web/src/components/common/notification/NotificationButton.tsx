'use client';

import { FaBell } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUnreadCount } from '@moimi/core/hooks/useNotificationQuery';

export default function NotificationButton() {
  const router = useRouter();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <button
      type="button"
      onClick={() => router.push('/notification')}
      aria-label={
        unreadCount > 0 ? `알림, 읽지 않은 알림 ${unreadCount}개` : '알림'
      }
      className="fixed top-4 right-6 z-80 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white text-[#2c2c2c] transition-all duration-150 active:scale-90 md:top-8"
    >
      <FaBell size={18} />

      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5E8EEF] px-1 text-[10px] leading-none font-bold text-white"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
