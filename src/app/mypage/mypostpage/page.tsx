'use client';

import { useState } from 'react';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';

const tabs = ['모집', '정보', '신청', '공지'];

export default function MyPostsPage() {
  const [selectedTab, setSelectedTab] = useState('모집');

  return (
    <main className="min-h-screen bg-[#F4F7FA]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-5 pt-10 pb-28">
        <NotificationButton />

        <h1 className="mb-4 text-[16px] font-bold text-[#2C2C2C]">
          &lt; 내가 작성한 글
        </h1>

        <section className="rounded-xl border border-[#D6DDE5] bg-white px-4 pt-3">
          <nav className="flex border-b border-[#D6DDE5]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`mr-6 pb-2 text-[14px] font-medium ${
                  selectedTab === tab
                    ? 'border-b-2 border-[#5B8CFF] text-[#5B8CFF]'
                    : 'text-[#C3CAD3]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="min-h-125 py-4">
            <p className="text-[14px] text-[#989898]">{selectedTab} 글 목록</p>
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}
