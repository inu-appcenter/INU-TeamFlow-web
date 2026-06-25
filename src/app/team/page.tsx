'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import { teams } from '@/mocks/teams';

import { ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

const categories = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '동아리', value: 'CLUB' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '기타', value: 'ETC' },
];

export default function Team() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredTeams = teams.filter((team) => {
    if (selectedCategory === 'ALL') return true;

    return team.category === selectedCategory;
  });

  return (
    <main className="h-screen overflow-hidden bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <div className="hidden lg:block">
        <NotificationButton />
      </div>

      <section className="mx-auto mt-8 flex h-[calc(100vh-48px)] min-h-0 max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <div className="mb-3 flex items-end justify-between pl-4">
          <h1 className="text-2xl font-bold text-[#2C2C2C]">나의 팀 목록</h1>

          <button
            onClick={() => router.push('/team/create')}
            className="z-50 flex cursor-pointer items-center gap-2 rounded-xl bg-[#5E92F0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4C82E5]"
          >
            <Plus size={18} />팀 생성하기
          </button>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-none p-6">
          <div className="mb-4 flex border-b-[0.5px] border-[#D6DDE5]">
            {categories.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`z-50 cursor-pointer px-4 pb-4 text-lg font-bold whitespace-nowrap transition sm:text-xl md:px-6 md:pb-4 ${
                    isActive
                      ? 'border-b-2 border-[#5E92F0] text-[#5E92F0]'
                      : 'text-[#CBD2DA] hover:text-[#8E98A3]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2">
              {filteredTeams.map((team) => (
                <button
                  key={team.teamId}
                  onClick={() => router.push(`/team/${team.teamId}`)}
                  className="z-50 cursor-pointer overflow-hidden rounded-2xl bg-[#F8F9FB] text-left"
                >
                  <div
                    className="h-12"
                    style={{ backgroundColor: categoryColorMap[team.category] }}
                  />

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[#2C2C2C]">
                        {team.name}
                      </h2>

                      <ChevronRight size={22} />
                    </div>

                    <p className="mb-6 truncate text-sm text-[#9C9C9C]">
                      {team.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#D6DDE5] px-3 py-1 text-xs font-semibold text-[#3F4852]">
                        {categoryMap[team.category]}
                      </span>

                      <span className="text-xs text-[#D4D4D4]">
                        {team.memberCount}명
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <BottomNav />
    </main>
  );
}
