'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';

import Card from '@/components/main/Card';
import InputField from '@/components/register/InputField';
import { LOGIN_TEXT } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/hooks/useAuthQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useFcm } from '@/hooks/useFcm';

export default function Login() {
  const router = useRouter();

  const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
  const { registerFcmToken } = useFcm();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const login = () => {
    const trimmedUsername = username.trim();

    if (trimmedUsername === '') {
      showErrorMessage('아이디를 입력해주세요');
      return;
    }

    if (password === '') {
      showErrorMessage('비밀번호를 입력해주세요');
      return;
    }

    loginMutate(
      {
        username: trimmedUsername,
        password,
      },
      {
        onSuccess: async (data) => {
          localStorage.setItem('accessToken', data.accessToken);

          try {
            await registerFcmToken();
          } catch (error) {
            console.error('FCM 토큰 등록 실패:', error);
          }

          router.push(ROUTES.MAIN);
        },
        onError: () => {
          showErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다');
          setPassword('');
        },
      }
    );
  };

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();

    if (isLoginPending) return;

    login();
  };

  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto flex min-h-[calc(100dvh-16px)] max-w-3xl flex-col justify-center px-5">
        <Card className="animate-modal-pop flex flex-col overflow-hidden p-0 transition-all duration-200">
          <button
            type="button"
            onClick={() => router.push(ROUTES.MAIN)}
            className="mt-4 ml-2 w-7 cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
          >
            <ChevronLeft
              size={24}
              strokeWidth={2.5}
              className="relative max-w-7 sm:h-7 sm:w-7"
            />
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-6 flex items-center">
              <h1 className="relative left-1/2 -translate-x-1/2 text-[28px] font-semibold max-[640px]:text-[24px]">
                {LOGIN_TEXT.TITLE}
              </h1>
            </div>

            <InputField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fieldName={LOGIN_TEXT.USERNAME_LABEL}
              typeOption="text"
              placeHolder={LOGIN_TEXT.USERNAME_PLACEHOLDER}
              isInput={true}
            />

            <InputField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              onBlur={() => setIsCapsLockOn(false)}
              fieldName={LOGIN_TEXT.PASSWORD_LABEL}
              typeOption={isPasswordVisible ? 'text' : 'password'}
              placeHolder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
              isInput={true}
              rightElement={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={
                    isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
                  }
                  className="flex size-6 items-center justify-center text-[#9C9C9C] transition-all duration-150 hover:text-[#5E92F0] active:scale-90"
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
              <div className="mx-7.5 -mt-3 mb-4 flex items-center gap-2 text-sm text-[#EF4444]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-xs font-bold">
                  !
                </span>

                <span className="font-medium">Caps Lock이 켜져 있어요</span>
              </div>
            )}

            <span
              className="mx-7.5 mb-4 line-clamp-2 text-ellipsis text-[#9c9c9c] max-[320px]:cursor-pointer"
              onClick={() => {
                if (window.innerWidth <= 320) {
                  router.push(ROUTES.REGISTER);
                }
              }}
            >
              {LOGIN_TEXT.NO_ACCOUNT}
              <span
                onClick={() => router.push(ROUTES.REGISTER)}
                className="cursor-pointer text-nowrap text-[#5E92F0]"
              >
                {LOGIN_TEXT.REGISTER}
              </span>
            </span>

            <button
              type="submit"
              disabled={isLoginPending}
              className="relative left-1/2 mb-7 w-[25%] min-w-22 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2 text-[16px] text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
            >
              {isLoginPending ? '로그인 중...' : LOGIN_TEXT.TITLE}
            </button>
          </form>
        </Card>
      </section>
    </main>
  );
}
