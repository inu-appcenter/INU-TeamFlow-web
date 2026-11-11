'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Home,
  Users,
  CalendarDays,
  CircleUser,
  MessagesSquare,
} from 'lucide-react';
import BottomNavItem from './BottomNavItem';
import { useUnreadChatCount } from '@moimi/core/hooks/chat/useUnreadChatCount';

const navItems = [
  { icon: Home, label: '홈', href: '/main' },
  { icon: CalendarDays, label: '캘린더', href: '/calendar' },
  { icon: Users, label: '팀', href: '/team' },
  { icon: MessagesSquare, label: '채팅', href: '/chat' },
  { icon: CircleUser, label: '마이페이지', href: '/mypage' },
];

export default function BottomNav() {
  const unreadChatCount = useUnreadChatCount();
  const pathname = usePathname();
  const activeIndex = navItems.findIndex((item) => item.href === pathname);

  return (
    <nav className="pointer-events-none fixed right-4 bottom-6 left-4 z-50 h-[68px] rounded-full border border-[#EDF1F5] bg-white/60 shadow-[6px_8px_24px_0px_rgba(149,157,165,0.20)] backdrop-blur-md sm:right-auto sm:bottom-10 sm:left-1/2 sm:w-[80%] sm:max-w-[800px] sm:-translate-x-1/2 xl:w-[60%]">
      <ul className="pointer-events-auto relative flex h-full items-center justify-between">
        {/* 활성 탭 인디케이터: 위치 측정 없이 인덱스로 이동 */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{
            x: `${Math.max(activeIndex, 0) * 100}%`,
            opacity: activeIndex === -1 ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ width: `${100 / navItems.length}%` }}
          className="absolute inset-y-0 left-0 rounded-full bg-[#EEF1F5]/80 shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(149,157,165,0.15),inset_0_0_8px_rgba(255,255,255,0.25),0_1px_4px_rgba(149,157,165,0.15)] ring-1 ring-white/40 backdrop-blur-[3px]"
        />

        {navItems.map((item) => (
          <BottomNavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={item.href === pathname}
            badgeCount={item.href === '/chat' ? unreadChatCount : 0}
          />
        ))}
      </ul>
    </nav>
  );
}
