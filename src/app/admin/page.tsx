// src/app/admin/page.tsx
import Card from '@/components/main/Card';
import { Users, MessageSquare, ShieldAlert, ClipboardList } from 'lucide-react';

const STATS = [
  { label: '전체 회원', value: '—', icon: Users },
  { label: '대기중인 문의', value: '—', icon: MessageSquare },
  { label: '대기중인 신고', value: '—', icon: ShieldAlert },
  { label: '전체 게시글', value: '—', icon: ClipboardList },
] as const;

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2C2C2C]">대시보드</h1>
      <p className="mt-1 text-sm text-[#9C9C9C]">
        서비스 현황을 한눈에 확인하세요
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                  {stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-[#2C2C2C]">최근 문의</h2>
          <div className="mt-4 flex h-[180px] items-center justify-center text-sm text-[#9C9C9C]">
            백엔드 연동 후 표시됩니다
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-[#2C2C2C]">최근 신고</h2>
          <div className="mt-4 flex h-[180px] items-center justify-center text-sm text-[#9C9C9C]">
            백엔드 연동 후 표시됩니다
          </div>
        </Card>
      </div>
    </div>
  );
}
