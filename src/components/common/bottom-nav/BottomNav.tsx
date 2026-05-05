'use client';

import { Home, Users, CalendarDays, CircleUser } from 'lucide-react';
import BottomNavItem from './BottomNavItem';

const navItems = [
  {
    icon: Home,
    label: '홈',
    href: '/main',
  },
  {
    icon: Users,
    label: '팀',
    href: '/team',
  },
  {
    icon: CalendarDays,
    label: '캘린더',
    href: '/calendar',
  },
  {
    icon: CircleUser,
    label: '마이페이지',
    href: '/mypage',
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-10 left-1/2 z-50 h-[72px] w-[70%] max-w-[700px] -translate-x-1/2 rounded-full border border-[#EDF1F5] bg-white/90 shadow-[6px_8px_24px_0px_rgba(149,157,165,0.20)] transition-all duration-300 ease-in-out">
      <ul className="flex h-full items-center justify-center px-2">
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
