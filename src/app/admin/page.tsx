'use client';

import Card from '@/components/main/Card';
import { ShieldAlert, ClipboardCheck, ClipboardList } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();

  const summary = data?.summary;
  const items = data?.items.content ?? [];

  const recentInquiries = items.filter((item) => item.itemType === 'INQUIRY');
  const recentReports = items.filter((item) => item.itemType === 'REPORT');

  const STATS = [
    { label: '전체', value: summary?.total, icon: ClipboardList },
    { label: '대기중', value: summary?.pending, icon: ShieldAlert },
    { label: '처리완료', value: summary?.resolved, icon: ClipboardCheck },
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2C2C2C]">대시보드</h1>
      <p className="mt-1 text-sm text-[#9C9C9C]">
        서비스 현황을 한눈에 확인하세요
      </p>

      {isError && (
        <p className="mt-4 text-sm text-[#B32424]">
          대시보드 정보를 불러오지 못했어요.
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex flex-col gap-3 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF1F5] text-[#5E92F0]">
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9C9C9C]">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-[#2C2C2C]">
                  {isLoading || stat.value === undefined ? '—' : stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-[#2C2C2C]">최근 문의</h2>
          {isLoading ? (
            <div className="mt-3 flex h-[170px] items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          ) : recentInquiries.length === 0 ? (
            <div className="mt-3 flex h-[170px] items-center justify-center text-sm text-[#9C9C9C]">
              최근 문의가 없어요
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0F2F5]">
              {recentInquiries.slice(0, 5).map((item) => (
                <li
                  key={item.refId}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="truncate text-[#2C2C2C]">{item.detail}</span>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.status === 'PENDING'
                        ? 'bg-[#FFDDDD] text-[#B32424]'
                        : 'bg-[#DDF7E5] text-[#2F8F4E]'
                    }`}
                  >
                    {item.status === 'PENDING' ? '대기중' : '처리완료'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-[#2C2C2C]">최근 신고</h2>
          {isLoading ? (
            <div className="mt-3 flex h-[170px] items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          ) : recentReports.length === 0 ? (
            <div className="mt-3 flex h-[170px] items-center justify-center text-sm text-[#9C9C9C]">
              최근 신고가 없어요
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0F2F5]">
              {recentReports.slice(0, 5).map((item) => (
                <li
                  key={item.refId}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="truncate text-[#2C2C2C]">{item.detail}</span>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.status === 'PENDING'
                        ? 'bg-[#FFDDDD] text-[#B32424]'
                        : 'bg-[#DDF7E5] text-[#2F8F4E]'
                    }`}
                  >
                    {item.status === 'PENDING' ? '대기중' : '처리완료'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
