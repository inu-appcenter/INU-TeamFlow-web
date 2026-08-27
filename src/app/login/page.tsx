'use client';

import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';

import Card from '@/components/main/Card';
import InputField from '@/components/register/InputField';
import { LOGIN_TEXT } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/hooks/useAuthQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useFcm } from '@/hooks/useFcm';

export default function Login() {
  const router = useRouter();
  const { refetchUser } = useAuth();

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
            await refetchUser();
          } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
          }

          try {
            await registerFcmToken();
          } catch (error) {
            console.error('FCM 토큰 등록 실패:', error);
          }

          router.replace(ROUTES.MAIN);
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
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-6 flex items-center">
              <h1 className="relative left-1/2 -translate-x-1/2 pt-8 text-[28px] font-semibold max-[640px]:text-[24px]">
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

            <span
              className="mx-7.5 mb-4 line-clamp-2 text-sm font-medium text-ellipsis text-[#989898] max-[320px]:cursor-pointer"
              onClick={() => {
                if (window.innerWidth <= 320) {
                  router.push(ROUTES.REGISTER);
                }
              }}
            >
              {LOGIN_TEXT.NO_ACCOUNT}
              <span
                onClick={() => router.push(ROUTES.REGISTER)}
                className="relative cursor-pointer font-semibold text-nowrap text-[#5E92F0] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-[#5E92F0] after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {LOGIN_TEXT.REGISTER}
              </span>
            </span>

            <button
              type="submit"
              disabled={isLoginPending}
              className="group relative left-1/2 mb-7 w-[25%] min-w-22 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2.5 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
            >
              <span className="inline-flex items-center justify-center">
                {LOGIN_TEXT.TITLE}
                {isLoginPending ? (
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
    </main>
  );
}
