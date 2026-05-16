'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

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
    <li className="h-full flex-1">
      <Link
        href={href}
        className={`flex h-full flex-col items-center justify-center rounded-full px-2 py-2 transition-all duration-200 ease-in-out sm:px-5 ${
          isActive
            ? 'bg-[#EDF1F5]/70 text-[#2c2c2c]/90'
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
