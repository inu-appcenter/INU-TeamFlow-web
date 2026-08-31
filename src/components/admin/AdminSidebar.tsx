// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { LayoutDashboard, Mail, ShieldAlert } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  {
    href: '/admin/inquiries',
    label: '문의 관리',
    icon: Mail,
    exact: false,
  },
  {
    href: '/admin/reports',
    label: '신고 관리',
    icon: ShieldAlert,
    exact: false,
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col border-r-[0.5px] border-[#D6DDE5] bg-white px-4 py-6">
      <div className="mb-8 px-3">
        <p className="text-lg font-bold text-[#2C2C2C]">Moimi</p>
        <p className="mt-0.5 text-sm font-semibold text-[#989898]">
          관리자 페이지
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative">
              {isActive && (
                <motion.div
                  layoutId="adminSidebarIndicator"
                  className="absolute inset-0 rounded-xl bg-[#F0F2F5]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <div
                className={`relative z-10 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#5E92F0]'
                    : 'text-[#989898] hover:text-[#5E92F0]'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="mb-3 border-t-[0.5px] border-[#D6DDE5]" />
        <Link
          href="/main"
          className="flex items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-[#989898] transition-colors hover:bg-[#F6F8FA] hover:text-[#2C2C2C]"
        >
          메인 화면으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
