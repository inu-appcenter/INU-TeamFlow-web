'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import { useMyTeams } from '@/hooks/team/useTeamQuery';
import { ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSchoolVerificationGuard } from '@/hooks/useSchoolVerificationGuard';
import { TeamListSkeleton } from '@/components/skeleton';
import { motion } from 'motion/react';
import {
  categoryMap,
  categoryColorMap,
  categoryFilterOptions,
} from '@/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function Team() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { data: teams = [], isLoading } = useMyTeams();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { checkVerified } = useSchoolVerificationGuard(showErrorMessage);

  const filteredTeams = teams.filter((team) => {
    if (selectedCategory === 'ALL') return true;

    return team.category === selectedCategory;
  });

  return (
    <main className="h-screen overflow-hidden bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-150 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <div className="hidden lg:block">
        <NotificationButton />
      </div>

      <section className="mx-auto mt-8 flex h-[calc(100vh-48px)] min-h-0 max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <div className="mb-3 flex items-end justify-between pl-4">
          <h1 className="text-2xl font-bold text-[#2C2C2C]">나의 팀 목록</h1>

          <button
            onClick={() => {
              if (!checkVerified()) return;
              router.push('/team/create');
            }}
            className="z-50 flex cursor-pointer items-center gap-1 rounded-lg bg-[#5E92F0] py-2.5 pr-4 pl-3.5 text-[15px] font-medium text-white transition hover:bg-[#4C82E5]"
          >
            <Plus size={18} strokeWidth={2.5} />팀 생성하기
          </button>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-none p-5">
          <div className="relative flex border-b-[0.5px] border-[#D6DDE5]">
            {categoryFilterOptions.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`relative z-50 flex-1 cursor-pointer pb-4 text-center text-lg font-bold whitespace-nowrap transition sm:text-xl ${
                    isActive
                      ? 'text-[#5E92F0]'
                      : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                  }`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="teamCategoryIndicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                      transition={{
                        type: 'spring',
                        stiffness: 600,
                        damping: 50,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto pt-4">
            {isLoading ? (
              <TeamListSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2">
                {filteredTeams.map((team) => (
                  <button
                    key={team.teamId}
                    onClick={() => router.push(`/team/${team.teamId}`)}
                    className="z-50 cursor-pointer overflow-hidden rounded-2xl bg-[#F8F9FB] text-left"
                  >
                    <div
                      className="h-12"
                      style={{
                        backgroundColor: categoryColorMap[team.category],
                      }}
                    />

                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#2C2C2C]">
                          {team.name}
                        </h2>

                        <ChevronRight size={22} strokeWidth={2.5} />
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
            )}
          </div>
        </Card>
      </section>

      <BottomNav />
    </main>
  );
}
