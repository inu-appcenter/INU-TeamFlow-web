'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import Card from '@/components/main/Card';
import InputField from '@/components/register/InputField';
import { MESSAGES, SIGN_IN_TEXT } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/hooks/useAuthQuery';

export default function SignIn() {
  const router = useRouter();

  const { mutate: loginMutate, isPending: isLoginPending } = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    if (username.trim() === '' || password.trim() === '') {
      alert(MESSAGES.SIGN_IN.ERROR);
      return;
    }

    loginMutate(
      {
        username,
        password,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem('accessToken', data.accessToken);
          alert(MESSAGES.SIGN_IN.SUCCESS);
          router.push(ROUTES.MAIN);
        },
        onError: () => {
          alert(MESSAGES.SIGN_IN.ERROR);
        },
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4">
      <section className="mx-auto flex min-h-[calc(100dvh-16px)] max-w-3xl flex-col justify-center px-5">
        <Card className="animate-modal-pop flex flex-col overflow-hidden p-0 transition-all duration-200">
          <button
            onClick={() => router.push('/main')}
            className="mt-4 ml-2 w-7 cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
          >
            <ChevronLeft
              size={24}
              strokeWidth={2.5}
              className="relative max-w-7 sm:h-7 sm:w-7"
            />
          </button>

          <div className="mb-6 flex items-center">
            <h1 className="relative left-1/2 -translate-x-1/2 text-[28px] font-semibold max-[640px]:text-[24px]">
              {SIGN_IN_TEXT.TITLE}
            </h1>
          </div>

          <InputField
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fieldName={SIGN_IN_TEXT.USERNAME_LABEL}
            typeOption="text"
            placeHolder={SIGN_IN_TEXT.USERNAME_PLACEHOLDER}
            isInput={true}
          />

          <InputField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fieldName={SIGN_IN_TEXT.PASSWORD_LABEL}
            typeOption="password"
            placeHolder={SIGN_IN_TEXT.PASSWORD_PLACEHOLDER}
            isInput={true}
          />

          <span
            className="mx-7.5 mb-4 line-clamp-2 text-ellipsis text-[#9c9c9c] max-[320px]:cursor-pointer"
            onClick={() => {
              if (window.innerWidth <= 320) {
                router.push(ROUTES.REGISTER);
              }
            }}
          >
            {SIGN_IN_TEXT.NO_ACCOUNT}
            <span
              onClick={() => router.push(ROUTES.REGISTER)}
              className="cursor-pointer text-nowrap text-[#5E92F0]"
            >
              {SIGN_IN_TEXT.REGISTER}
            </span>
          </span>

          <button
            onClick={login}
            disabled={isLoginPending}
            className="relative left-1/2 mb-7 w-[25%] min-w-22 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2 text-[16px] text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
          >
            {isLoginPending ? '로그인 중...' : SIGN_IN_TEXT.TITLE}
          </button>
        </Card>
      </section>
    </main>
  );
}