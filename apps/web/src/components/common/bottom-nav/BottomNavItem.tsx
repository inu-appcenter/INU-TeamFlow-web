'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface BottomNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  badgeCount?: number;
}

export default function BottomNavItem({
  icon: Icon,
  label,
  href,
  isActive,
  badgeCount = 0,
}: BottomNavItemProps) {
  return (
    <li className="relative h-full flex-1">
      <Link
        href={href}
        className={`relative flex h-full flex-col items-center justify-center rounded-full px-2 py-2 transition-colors duration-200 ease-in-out sm:px-5 ${
          isActive
            ? 'text-[#2c2c2c]/90'
            : 'text-[#A2A9B2]/80 hover:text-gray-600'
        }`}
      >
        <div className="relative">
          <Icon
            size={20}
            strokeWidth={1.8}
            className="mb-0.5 sm:mb-1 sm:h-[22px] sm:w-[22px]"
          />
          {badgeCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#5E92F0] text-[9px] font-semibold text-white sm:-right-3 sm:h-5 sm:w-5 sm:text-[10px]">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold whitespace-nowrap sm:text-sm">
          {label}
        </span>
      </Link>
    </li>
  );
}
