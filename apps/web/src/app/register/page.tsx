'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
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
            <div className="">
              <button
                type="button"
                onClick={() => router.push(ROUTES.LOGIN)}
                aria-label="로그인 페이지로 돌아가기"
                className="cursor-pointer pt-6 pl-5 text-[#2C2C2C]/80 transition-all duration-150 hover:text-[#2C2C2C] active:scale-90"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>

              <div className="-mt-6 mb-6 flex items-center">
                <h1 className="relative left-1/2 -translate-x-1/2 text-[28px] font-semibold max-[640px]:text-[24px]">
                  {REGISTER_TEXT.TITLE}
                </h1>
              </div>
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
                  className="flex cursor-pointer items-center justify-center text-[#989898] transition-all duration-150 hover:text-[#5E92F0] active:scale-90"
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
                className={`mx-7.5 -mt-2 mb-4 flex items-center gap-2 text-[14px] ${
                  isPasswordMatched ? 'text-[#22A06B]' : 'text-[#E22222]'
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
              <div className="mx-7.5 -mt-3 mb-4 flex items-center gap-2 text-[14px] text-[#E22222]">
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

            <label className="mx-7.5 mb-1 block text-[14px] font-medium text-[#989898] max-[640px]:text-[12px]">
              학과
            </label>

            <div className="mx-7.5 mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <select
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setDepartment('');
                  }}
                  className="h-13 w-full min-w-0 appearance-none rounded-xl bg-[#F6F8FA] px-5 pr-10 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none active:scale-[0.99] max-[640px]:py-2 max-[640px]:pr-8 max-[640px]:pl-3 max-[640px]:text-[13px]"
                >
                  <option value="">단과대 선택</option>
                  {colleges.map((college: College) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#989898]"
                />
              </div>

              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!college}
                  className="h-13 w-full min-w-0 appearance-none rounded-xl bg-[#F6F8FA] px-5 pr-10 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none active:scale-[0.99] disabled:text-[#B0B8C1] max-[640px]:py-2 max-[640px]:pr-8 max-[640px]:pl-3 max-[640px]:text-[13px]"
                >
                  <option value="">학과 선택</option>
                  {currentCollege?.departments.map((department) => (
                    <option key={department.value} value={department.value}>
                      {department.name}
                      {department.note ? ` ${department.note}` : ''}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#989898]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSignupPending}
              className="group relative left-1/2 mb-7 w-[25%] min-w-22 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2.5 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
            >
              <span className="inline-flex items-center justify-center">
                {REGISTER_TEXT.REGISTER_BUTTON}
                {isSignupPending ? (
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
