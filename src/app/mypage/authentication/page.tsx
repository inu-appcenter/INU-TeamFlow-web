'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import inuLogo from '@/public/images/inuLogo/inu-logo.png';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { useVerifySchool } from '@/hooks/useAuthQuery';

export default function SchoolAuthenticationPage() {
  const router = useRouter();

  const [studentNumber, setStudentNumber] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const { mutate: verifySchoolMutate, isPending } = useVerifySchool();
const handleVerifySchool = () => {
  if (studentNumber.trim() === '' || portalPassword.trim() === '') {
    alert('학번과 비밀번호를 입력해주세요.');
    return;
  }

  verifySchoolMutate(
    {
      studentNumber,
      portalPassword,
    },
    {
      onSuccess: (data) => {
        console.log('학교 인증 응답:', data);
        alert('학교 인증이 완료되었습니다.');
        router.push('/mypage');
      },
      onError: () => {
        alert('학교 인증에 실패했습니다.');
      },
    }
  );
};

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center gap-3 px-1">
        <button
          onClick={() => router.push('/mypage')}
          className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        <div>
          <h1 className="text-[26px] font-bold text-[#2C2C2C]">학교 인증</h1>
          <p className="mt-1 text-[14px] text-[#989898]">
            인천대학교 포털 계정으로 본인 인증을 진행해요
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px]">
        <section className="animate-modal-pop flex min-h-[620px] flex-col rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white px-6 py-8 transition-all duration-200 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center">
            <div className="my-10 flex flex-col items-center text-center">
              <Image
                src={inuLogo}
                alt="INU 로고"
                className="h-[90px] w-auto object-contain sm:h-[110px]"
              />
            </div>

            <div className="rounded-3xl p-5 sm:p-7">
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#2C2C2C]">
                  학번
                </label>
                <input
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="학번을 입력하세요"
                  className="h-[54px] w-full rounded-2xl border border-[#D6DDE5] bg-white px-4 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[13px] font-semibold text-[#2C2C2C]">
                  비밀번호
                </label>
                <input
                  value={portalPassword}
                  onChange={(e) => setPortalPassword(e.target.value)}
                  type="password"
                  placeholder="포털 비밀번호를 입력하세요"
                  className="h-[54px] w-full rounded-2xl border border-[#D6DDE5] bg-white px-4 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0]"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifySchool}
                disabled={isPending}
                className="mt-6 flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#5E92F0] text-[15px] font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
              >
                {isPending ? '인증 중...' : '인증하기'}
              </button>
            </div>

            <p className="mt-5 text-center text-[12px] leading-5 text-[#B0B8C1]">
              입력한 정보는 학교 인증 목적으로만 사용됩니다.
            </p>
          </div>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}
