'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/main/Card';
import InputField from '@/components/register/InputField';
import { registerList } from '@/mocks/register';
import { MESSAGES, REGISTER_TEXT } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';

export default function Register() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isUserNameChecked, setIsUserNameChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const emailCheck = () => {
    const check = registerList.find((user) => user.email === email);
    if (check) {
      alert(MESSAGES.REGISTER.EMAIL.DUPLICATED);
    } else if (email.trim() === '') {
      alert(MESSAGES.REGISTER.EMAIL.EMPTY);
    } else {
      setIsEmailChecked(true);
      alert(MESSAGES.REGISTER.EMAIL.AVAILABLE);
    }
  };

  const userNameCheck = () => {
    const check = registerList.find((user) => user.userName === userName);
    if (check) {
      alert(MESSAGES.REGISTER.USERNAME.DUPLICATED);
    } else if (userName.trim() === '') {
      alert(MESSAGES.REGISTER.USERNAME.EMPTY);
    } else {
      setIsUserNameChecked(true);
      alert(MESSAGES.REGISTER.USERNAME.AVAILABLE);
    }
  };

  const register = () => {
    const emailCheck = registerList.find((user) => user.email === email);
    const userNameCheck = registerList.find(
      (user) => user.userName === userName
    );
    if (
      userName.trim() === '' ||
      password.trim() === '' ||
      email.trim() === '' ||
      name.trim() === '' ||
      department.trim() === ''
    ) {
      //Null값 체크
      alert(MESSAGES.REGISTER.EMPTY_FIELD);
    } else if (password !== checkPassword) {
      //비밀번호 확인
      alert(MESSAGES.REGISTER.PASSWORD_MISMATCH);
    } else if (!isUserNameChecked || !isEmailChecked) {
      //중복확인처리 했는지 확인하기
      alert(MESSAGES.REGISTER.NEED_DUPLICATE_CHECK);
    } else if (emailCheck?.email === email) {
      //중복확인 이후에 가입된 이메일이 될 수 있음
      alert(MESSAGES.REGISTER.EMAIL_ALREADY_EXISTS);
    } else if (userNameCheck?.userName === userName) {
      //중복확인 이후에 가입된 이름이 있을 수 있음
      alert(MESSAGES.REGISTER.USERNAME_ALREADY_EXISTS);
    } else {
      console.log(userName, password, email, name, department);
      router.push(ROUTES.SIGNIN);
    }
  };
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4">
      <section className="mx-auto flex min-h-[calc(100dvh-16px)] max-w-3xl flex-col justify-center px-5">
        <Card className="flex flex-col overflow-hidden p-0">
          <button
            onClick={() => router.back()}
            className="mt-4 ml-2 w-7 cursor-pointer text-[#2C2C2C]"
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
            check={true}
            onClick={userNameCheck}
          />
          <InputField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fieldName={REGISTER_TEXT.PASSWORD_LABEL}
            typeOption="password"
            placeHolder={REGISTER_TEXT.PASSWORD_PLACEHOLDER}
            isInput={true}
          />
          <InputField
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
            fieldName={REGISTER_TEXT.CHECK_PASSWORD_LABEL}
            typeOption="password"
            placeHolder={REGISTER_TEXT.CHECK_PASSWORD_PLACEHOLDER}
            isInput={true}
          />
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
            typeOption="text"
            placeHolder={REGISTER_TEXT.EMAIL_PLACEHOLDER}
            isInput={true}
            check={true}
            onClick={emailCheck}
          />
          <InputField
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            fieldName={REGISTER_TEXT.DEPARTMENT_LABEL}
            isSelect={true}
          />

          <button
            onClick={register}
            className="relative left-1/2 mb-7 w-[25%] min-w-22 -translate-x-1/2 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-2 text-[14px] text-nowrap text-white transition hover:bg-[#5C86EB]"
          >
            {REGISTER_TEXT.REGISTER_BUTTON}
          </button>
        </Card>
      </section>
    </main>
  );
}
