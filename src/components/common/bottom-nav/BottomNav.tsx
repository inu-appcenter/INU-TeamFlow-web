'use client';

import {
  Home,
  Users,
  CalendarDays,
  CircleUser,
  MessagesSquare,
} from 'lucide-react';
import BottomNavItem from './BottomNavItem';

const navItems = [
  {
    icon: Home,
    label: '홈',
    href: '/main',
  },
  {
    icon: CalendarDays,
    label: '캘린더',
    href: '/calendar',
  },
  {
    icon: Users,
    label: '팀',
    href: '/team',
  },
  {
    icon: MessagesSquare,
    label: '채팅',
    href: '/chatting',
  },

  {
    icon: CircleUser,
    label: '마이페이지',
    href: '/mypage',
  },
];

export default function BottomNav() {
  return (
    <nav className="pointer-events-none fixed right-4 bottom-6 left-4 z-50 h-[68px] rounded-full border border-[#EDF1F5] bg-white/60 shadow-[6px_8px_24px_0px_rgba(149,157,165,0.20)] backdrop-blur-md transition-all duration-300 ease-in-out sm:right-auto sm:bottom-10 sm:left-1/2 sm:w-[70%] sm:max-w-[800px] sm:-translate-x-1/2">
      <ul className="pointer-events-auto relative flex h-full items-center justify-between px-0 sm:px-0">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </ul>
    </nav>
  );
}
