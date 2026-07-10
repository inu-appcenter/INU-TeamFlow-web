'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export default function BottomNavItem({
  icon: Icon,
  label,
  href,
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
        <Icon
          size={20}
          strokeWidth={1.8}
          className="mb-0.5 sm:mb-1 sm:h-[22px] sm:w-[22px]"
        />
        <span className="text-[11px] font-bold whitespace-nowrap sm:text-sm">
          {label}
        </span>
      </Link>
    </li>
  );
}
