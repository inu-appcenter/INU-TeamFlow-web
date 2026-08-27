'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import Image from 'next/image';
import inuLogo from '@/public/images/inuLogo/inu-logo.png';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import { useVerifySchool } from '@/hooks/useAuthQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import InputField from '@/components/register/InputField';

export default function SchoolAuthenticationPage() {
  const router = useRouter();

  const [studentNumber, setStudentNumber] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const { mutate: verifySchoolMutate, isPending } = useVerifySchool();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const { errorMessage, showErrorMessage } = useErrorToast();

  const handleVerifySchool = () => {
    if (studentNumber.trim() === '' || portalPassword.trim() === '') {
      showErrorMessage('학번과 비밀번호를 입력해주세요');
      return;
    }

    verifySchoolMutate(
      {
        studentNumber,
        portalPassword,
      },
      {
        onSuccess: () => {
          router.push('/mypage');
        },
        onError: () => {
          showErrorMessage('학교 인증에 실패했습니다');
        },
      }
    );
  };

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();

    if (isPending) return;

    handleVerifySchool();
  };

  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 pb-28 sm:px-6">
      <NotificationButton />

      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto flex min-h-[calc(100dvh-176px)] max-w-3xl flex-col justify-center px-5">
        <Image
          src={inuLogo}
          alt="INU 로고"
          className="mb-8 h-[48px] w-auto object-contain sm:h-[56px]"
        />
        <Card className="animate-modal-pop relative flex flex-col overflow-hidden p-0 py-2 transition-all duration-200">
          <button
            type="button"
            onClick={() => router.push('/mypage')}
            aria-label="뒤로가기"
            className="absolute top-6 left-6 z-10 cursor-pointer text-[#2C2C2C]/80 transition-all duration-150 hover:text-[#2C2C2C] active:scale-90"
          >
            <ChevronLeft size={25} strokeWidth={2.5} />
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-6 flex flex-col items-center pt-6">
              <h1 className="text-[24px] font-semibold text-[#2C2C2C] max-[640px]:text-[22px]">
                학교 인증
              </h1>

              <p className="mt-1 text-[14px] text-[#989898]">
                인천대학교 포털 계정으로 본인 인증을 진행해요
              </p>
            </div>

            <InputField
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              fieldName="학번"
              typeOption="text"
              placeHolder="학번을 입력하세요"
              isInput={true}
            />

            <InputField
              value={portalPassword}
              onChange={(e) => setPortalPassword(e.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              onBlur={() => setIsCapsLockOn(false)}
              fieldName="비밀번호"
              typeOption={isPasswordVisible ? 'text' : 'password'}
              placeHolder="포털 비밀번호를 입력하세요"
              isInput={true}
              rightElement={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={
                    isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
                  }
                  className="flex size-6 items-center justify-center text-[#989898] transition-all duration-150 hover:text-[#5E92F0] active:scale-90"
                >
                  {isPasswordVisible ? (
                    <Eye className="block size-5" />
                  ) : (
                    <EyeOff className="block size-5" />
                  )}
                </button>
              }
            />

            {isCapsLockOn && (
              <div className="mx-7.5 -mt-2 mb-4 flex items-center gap-2 text-sm text-[#EF4444]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-xs font-bold">
                  !
                </span>

                <span className="font-medium">Caps Lock이 켜져 있어요</span>
              </div>
            )}

            <p className="mx-auto mb-1 text-[11px] leading-5 text-[#b0b0b0]">
              입력한 정보는 학교 인증 목적으로만 사용됩니다
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="group relative left-1/2 mb-7 w-[30%] min-w-32 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2.5 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
            >
              <span className="inline-flex items-center justify-center">
                {isPending ? '인증 중...' : '인증하기'}
                {isPending ? (
                  <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <span className="ml-0 inline-flex w-0 items-center justify-center overflow-hidden opacity-0 transition-all duration-200 group-hover:ml-1.5 group-hover:w-4 group-hover:opacity-100">
                    <ChevronRight
                      size={20}
                      className="-mr-2 shrink-0"
                      strokeWidth={2.5}
                    />
                  </span>
                )}
              </span>
            </button>
          </form>
        </Card>
      </section>

      <BottomNav />
    </main>
  );
}
