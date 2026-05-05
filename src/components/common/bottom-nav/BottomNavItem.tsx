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
    <li className="-mx-2 h-full flex-1">
      <Link
        href={href}
        className={`flex h-full flex-col items-center justify-center rounded-full px-5 py-2 transition-all duration-200 ease-in-out ${
          isActive
            ? 'bg-[#EDF1F5]/60 text-[#2c2c2c]/80'
            : 'text-[#A2A9B2]/80 hover:text-gray-600'
        } `}
      >
        <Icon size={22} strokeWidth={1.8} className="mb-1" />

        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}
