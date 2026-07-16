'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';

import Card from '@/components/main/Card';
import InputField from '@/components/register/InputField';
import { colleges } from '@/constants/departments';
import { MESSAGES, REGISTER_TEXT } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useSignup } from '@/hooks/useAuthQuery';
import { useErrorToast } from '@/hooks/useErrorToast';

interface Department {
  value: string;
  name: string;
  note?: string;
}

interface College {
  name: string;
  id: string;
  departments: Department[];
}

export default function Register() {
  const router = useRouter();

  const { mutate: signupMutate, isPending: isSignupPending } = useSignup();
  const { errorMessage, showErrorMessage } = useErrorToast();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const hasCheckPassword = checkPassword.length > 0;
  const isPasswordMatched = password === checkPassword;

  const currentCollege = colleges.find((item) => item.id === college);

  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };
  const isEmpty = (value: string) => value.trim() === '';

  const hasEmptyField = () =>
    [userName, password, checkPassword, email, name, college, department].some(
      isEmpty
    );

  const register = () => {
    if (hasEmptyField()) {
      showErrorMessage(MESSAGES.REGISTER.EMPTY_FIELD);
      return;
    }

    if (password !== checkPassword) {
      showErrorMessage(MESSAGES.REGISTER.PASSWORD_MISMATCH);
      return;
    }

    signupMutate(
      {
        username: userName.trim(),
        password,
        email: email.trim(),
        name: name.trim(),
        department,
        imageKey: null,
      },
      {
        onSuccess: () => {
          router.push(ROUTES.LOGIN);
        },
        onError: () => {
          showErrorMessage(
            '이미 사용 중인 아이디 또는 이메일이거나 입력 정보가 올바르지 않습니다'
          );
        },
      }
    );
  };

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();

    if (isSignupPending) return;

    register();
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#2C2C2C] px-5 py-3 text-[14px] font-medium whitespace-nowrap text-white shadow-lg">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto flex min-h-[calc(100dvh-16px)] max-w-3xl flex-col justify-center px-5">
        <Card className="animate-modal-pop overflow-hidden p-0 transition-all duration-200">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <button
              type="button"
              onClick={() => router.push(ROUTES.LOGIN)}
              aria-label="로그인 페이지로 돌아가기"
              className="mt-4 ml-2 w-7 cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
            >
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="relative sm:h-7 sm:w-7"
              />
            </button>

            <div className="mb-6 flex items-center">
              <h1 className="relative left-1/2 -translate-x-1/2 text-[28px] font-semibold max-[640px]:text-[24px]">
                {REGISTER_TEXT.TITLE}
              </h1>
            </div>

            <InputField
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fieldName={REGISTER_TEXT.USERNAME_LABEL}
              typeOption="text"
              placeHolder={REGISTER_TEXT.USERNAME_PLACEHOLDER}
              isInput={true}
            />

            <InputField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              onBlur={() => setIsCapsLockOn(false)}
              fieldName={REGISTER_TEXT.PASSWORD_LABEL}
              typeOption={isPasswordVisible ? 'text' : 'password'}
              placeHolder={REGISTER_TEXT.PASSWORD_PLACEHOLDER}
              isInput={true}
              rightElement={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={
                    isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
                  }
                  className="flex cursor-pointer items-center justify-center text-[#A0A7B2] transition-all duration-150 hover:text-[#5E92F0] active:scale-90"
                >
                  {isPasswordVisible ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              }
            />

            <InputField
              value={checkPassword}
              onChange={(e) => setCheckPassword(e.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              onBlur={() => setIsCapsLockOn(false)}
              fieldName={REGISTER_TEXT.CHECK_PASSWORD_LABEL}
              typeOption={isCheckPasswordVisible ? 'text' : 'password'}
              placeHolder={REGISTER_TEXT.CHECK_PASSWORD_PLACEHOLDER}
              isInput={true}
              rightElement={
                <button
                  type="button"
                  onClick={() => setIsCheckPasswordVisible((prev) => !prev)}
                  aria-label={
                    isCheckPasswordVisible
                      ? '비밀번호 확인 숨기기'
                      : '비밀번호 확인 보기'
                  }
                  className="flex cursor-pointer items-center justify-center text-[#A0A7B2] transition-all duration-150 hover:text-[#5E92F0] active:scale-90"
                >
                  {isCheckPasswordVisible ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              }
            />

            {hasCheckPassword && (
              <div
                className={`mx-7.5 -mt-3 mb-4 flex items-center gap-2 text-[14px] ${
                  isPasswordMatched ? 'text-[#22A06B]' : 'text-[#EF4444]'
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    isPasswordMatched ? 'bg-[#E8F7F0]' : 'bg-[#FDECEC]'
                  }`}
                >
                  {isPasswordMatched ? '✓' : '!'}
                </span>

                <span className="font-medium">
                  {isPasswordMatched
                    ? '비밀번호가 일치해요'
                    : '비밀번호가 일치하지 않아요'}
                </span>
              </div>
            )}

            {isCapsLockOn && (
              <div className="mx-7.5 -mt-3 mb-4 flex items-center gap-2 text-[14px] text-[#EF4444]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-[12px] font-bold">
                  !
                </span>

                <span className="font-medium">Caps Lock이 켜져 있어요</span>
              </div>
            )}

            <InputField
              value={name}
              onChange={(e) => setName(e.target.value)}
              fieldName={REGISTER_TEXT.NAME_LABEL}
              typeOption="text"
              placeHolder={REGISTER_TEXT.NAME_PLACEHOLDER}
              isInput={true}
            />

            <InputField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fieldName={REGISTER_TEXT.EMAIL_LABEL}
              typeOption="email"
              placeHolder={REGISTER_TEXT.EMAIL_PLACEHOLDER}
              isInput={true}
            />

            <div className="mx-auto mb-5 grid w-[88%] grid-cols-1 gap-2 max-[640px]:w-[90%] sm:grid-cols-2">
              <select
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setDepartment('');
                }}
                className="min-w-0 rounded-xl border border-[#D6DDE5] bg-white px-3 py-2.5 text-[14px] text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0] active:scale-[0.99]"
              >
                <option value="">단과대 선택</option>

                {colleges.map((college: College) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!college}
                className="min-w-0 rounded-xl border border-[#D6DDE5] bg-white px-3 py-2.5 text-[14px] text-[#2C2C2C] transition-all duration-150 outline-none focus:border-[#5E92F0] active:scale-[0.99] disabled:bg-[#F5F5F5] disabled:text-[#B0B8C1]"
              >
                <option value="">학과 선택</option>

                {currentCollege?.departments.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSignupPending}
              className="relative left-1/2 mb-7 w-[45%] min-w-28 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2.5 text-[14px] text-nowrap text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1] disabled:active:scale-100 sm:w-[25%]"
            >
              {isSignupPending ? '가입 중...' : REGISTER_TEXT.REGISTER_BUTTON}
            </button>
          </form>
        </Card>
      </section>
    </main>
  );
}
