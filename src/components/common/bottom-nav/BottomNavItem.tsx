'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badgeCount?: number;
}

export default function BottomNavItem({
  icon: Icon,
  label,
  href,
  badgeCount = 0,
}: BottomNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="relative h-full flex-1">
      {isActive && (
        <motion.div
          layoutId="bottomNavBlob"
          className="absolute inset-0 rounded-full bg-[#EEF1F5]/80 shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(149,157,165,0.15),inset_0_0_8px_rgba(255,255,255,0.25),0_1px_4px_rgba(149,157,165,0.15)] ring-1 ring-white/40 backdrop-blur-[3px]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
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
