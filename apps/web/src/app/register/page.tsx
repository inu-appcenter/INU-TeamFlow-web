'use client';

import { useRouter } from 'next/navigation';
import {
  Check,
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
import { colleges } from '@moimi/core/constants/departments';
import { MESSAGES, REGISTER_TEXT } from '@moimi/core/constants/messages';
import { ROUTES } from '@moimi/core/constants/routes';
import { useLogin, useSignup } from '@moimi/core/hooks/useAuthQuery';
import { useCreateNotificationOptions } from '@moimi/core/hooks/useNotificationOptionQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useFcm } from '@/hooks/useFcm';
import { useErrorToast } from '@/hooks/useErrorToast';
import PolicyModal from '@/components/register/PolicyModal';
import type { PolicyType } from '@moimi/core/types/policy';

type RegisterStep = 'terms' | 'info';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>('terms');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [openedPolicy, setOpenedPolicy] = useState<PolicyType | null>(null);
  const { mutateAsync: signup, isPending: isSignupPending } = useSignup();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const {
    mutateAsync: createNotificationOptions,
    isPending: isNotificationPending,
  } = useCreateNotificationOptions();
  const { refetchUser } = useAuth();
  const { registerFcmToken } = useFcm();
  const isRegistering =
    isSignupPending || isLoginPending || isNotificationPending;
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
  const isRequiredAgreed = agreedTerms && confirmedAge;
  const isAllAgreed = agreedTerms && confirmedAge && notificationEnabled;

  const handleAllAgreement = () => {
    const next = !isAllAgreed;

    setAgreedTerms(next);
    setConfirmedAge(next);
    setNotificationEnabled(next);
  };

  const handleBack = () => {
    if (step === 'info') {
      setStep('terms');
      return;
    }

    router.push(ROUTES.LOGIN);
  };
  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };
  const isEmpty = (value: string) => value.trim() === '';

  const hasEmptyField = () =>
    [userName, password, checkPassword, email, name, college, department].some(
      isEmpty
    );

  const register = async () => {
    if (!isRequiredAgreed) {
      showErrorMessage('필수 항목에 동의해주세요');
      setStep('terms');
      return;
    }

    if (hasEmptyField()) {
      showErrorMessage(MESSAGES.REGISTER.EMPTY_FIELD);
      return;
    }

    if (password !== checkPassword) {
      showErrorMessage(MESSAGES.REGISTER.PASSWORD_MISMATCH);
      return;
    }

    const username = userName.trim();

    // 1. 회원가입
    try {
      await signup({
        username,
        password,
        email: email.trim(),
        name: name.trim(),
        department,
        imageKey: null,
      });
    } catch {
      showErrorMessage(
        '이미 사용 중인 아이디 또는 이메일이거나 입력 정보가 올바르지 않습니다'
      );
      return;
    }

    // 2. 자동 로그인 + 토큰 저장
    try {
      const loginResponse = await login({
        username,
        password,
      });

      localStorage.setItem('accessToken', loginResponse.accessToken);
    } catch {
      showErrorMessage('회원가입 완료! 로그인 후 이용해주세요');

      router.replace(ROUTES.LOGIN);
      return;
    }

    // 3. 최초 알림 설정 생성
    try {
      await createNotificationOptions({
        noticeEnabled: notificationEnabled,
        inviteEnabled: notificationEnabled,
        applicationEnabled: notificationEnabled,
        calendarEnabled: notificationEnabled,
        chatEnabled: notificationEnabled,
      });
    } catch (error) {
      console.error('초기 알림 설정 실패:', error);
    }

    // 4. AuthContext 사용자 상태 갱신
    try {
      await refetchUser();
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }

    // 5. FCM 토큰 등록
    if (notificationEnabled) {
      try {
        await registerFcmToken();
      } catch (error) {
        console.error('FCM 토큰 등록 실패:', error);
      }
    }

    // 6. 메인으로 이동
    router.replace(ROUTES.MAIN);
  };

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();

    if (step !== 'info') return;
    if (isRegistering) return;

    void register();
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#2C2C2C] px-5 py-3 text-[14px] font-medium whitespace-nowrap text-white shadow-lg">
          {errorMessage}
        </div>
      )}

      <section className="mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-3xl flex-col justify-center px-0 sm:px-5">
        <Card className="animate-modal-pop overflow-hidden p-0 transition-all duration-200">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div>
              <button
                type="button"
                onClick={handleBack}
                aria-label={
                  step === 'terms'
                    ? '로그인 페이지로 돌아가기'
                    : '약관 동의로 돌아가기'
                }
                className="cursor-pointer pt-5 pl-5 text-[#2C2C2C]/60 transition-all duration-150 hover:text-[#2C2C2C] active:scale-90"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>

              <div className="-mt-6 mb-4 flex items-center">
                <h1 className="relative left-1/2 -translate-x-1/2 text-[24px] font-semibold sm:text-[28px]">
                  {REGISTER_TEXT.TITLE}
                </h1>
              </div>
            </div>

            <div className="mx-auto mb-4 flex w-full max-w-80 items-center px-2 sm:px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-[#5E92F0] text-[13px] font-semibold text-white">
                  1
                </div>

                <span
                  className={`text-[12px] font-medium ${
                    step === 'terms' ? 'text-[#5E92F0]' : 'text-[#989898]'
                  }`}
                >
                  약관 동의
                </span>
              </div>

              <div
                className={`mx-3 mb-6 h-0.5 flex-1 ${
                  step === 'info' ? 'bg-[#5E92F0]' : 'bg-[#E5E8EB]'
                }`}
              />

              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                    step === 'info'
                      ? 'bg-[#5E92F0] text-white'
                      : 'bg-[#E5E8EB] text-[#989898]'
                  }`}
                >
                  2
                </div>

                <span
                  className={`text-[12px] font-medium ${
                    step === 'info' ? 'text-[#5E92F0]' : 'text-[#989898]'
                  }`}
                >
                  정보 입력
                </span>
              </div>
            </div>
            {step === 'terms' && (
              <div className="px-4 pb-6 sm:px-7.5 sm:pb-7">
                <div className="mb-4">
                  <h2 className="mb-1 text-center text-[18px] font-semibold text-[#2C2C2C] sm:text-[20px]">
                    모이미 이용을 위해 약관을 확인해주세요
                  </h2>

                  <p className="text-center text-[14px] text-[#989898]">
                    필수 항목에 동의하면 다음 단계로 이동할 수 있어요
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAllAgreement}
                  className="mb-3 flex w-full cursor-pointer items-center gap-3 rounded-xl bg-[#F6F8FA] px-5 py-4 text-left transition-colors hover:bg-[#F0F2F5]"
                >
                  <CheckCircle checked={isAllAgreed} />

                  <span className="font-semibold text-[#2C2C2C]">
                    전체 동의
                  </span>
                </button>

                <div className="overflow-hidden rounded-xl border border-[#ECEFF2]">
                  {/* 이용약관 */}
                  <div className="flex items-center px-4 py-4 sm:px-5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={agreedTerms}
                      onClick={() => setAgreedTerms((prev) => !prev)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <CheckCircle checked={agreedTerms} />

                      <span className="text-[14px] text-[#4E5968]">
                        <strong className="mr-1 font-medium text-[#5E92F0]">
                          필수
                        </strong>
                        서비스 이용약관 동의
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenedPolicy('terms')}
                      aria-label="서비스 이용약관 보기"
                      className="cursor-pointer p-1 text-[#A0A7B2] transition-colors hover:text-[#5E92F0]"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="mx-5 h-px bg-[#ECEFF2]" />

                  {/* 연령 확인 */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={confirmedAge}
                    onClick={() => setConfirmedAge((prev) => !prev)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
                  >
                    <CheckCircle checked={confirmedAge} />

                    <span className="text-[14px] text-[#4E5968]">
                      <strong className="mr-1 font-medium text-[#5E92F0]">
                        필수
                      </strong>
                      본인은 만 14세 이상입니다
                    </span>
                  </button>

                  <div className="mx-5 h-px bg-[#ECEFF2]" />

                  {/* 알림 수신 */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={notificationEnabled}
                    onClick={() => setNotificationEnabled((prev) => !prev)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
                  >
                    <CheckCircle checked={notificationEnabled} />

                    <span className="text-[14px] text-[#4E5968]">
                      <strong className="mr-1 font-medium text-[#989898]">
                        선택
                      </strong>
                      서비스 알림 받기
                    </span>
                  </button>
                </div>
                <p className="mt-2 px-1 text-[10px] leading-5 text-[#989898] sm:text-[12px]">
                  알림별 수신 여부는 가입 후 알림 설정에서 언제든 변경할 수
                  있어요
                </p>
                <div className="mt-7">
                  <p className="mb-2 px-1 text-[13px] font-medium text-[#989898]">
                    서비스 정책
                  </p>

                  <div className="overflow-hidden rounded-xl bg-[#F9FAFB]">
                    <PolicyButton
                      label="개인정보 처리방침"
                      onClick={() => setOpenedPolicy('privacy')}
                    />

                    <div className="mx-5 h-px bg-[#ECEFF2]" />

                    <PolicyButton
                      label="커뮤니티 이용규칙"
                      onClick={() => setOpenedPolicy('community')}
                    />

                    <div className="mx-5 h-px bg-[#ECEFF2]" />

                    <PolicyButton
                      label="청소년 보호정책"
                      onClick={() => setOpenedPolicy('youth')}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isRequiredAgreed}
                  onClick={() => setStep('info')}
                  className="group mt-7 flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#5E92F0] px-10 py-3 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1] sm:mx-auto sm:w-auto sm:py-2"
                >
                  <span className="inline-flex items-center justify-center">
                    다음
                  </span>
                </button>
              </div>
            )}
            {step === 'info' && (
              <>
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
                <div className="mx-7.5 mb-5 grid grid-cols-1 gap-3 max-[640px]:gap-1.5 sm:grid-cols-2">
                  <div className="relative">
                    <select
                      value={college}
                      onChange={(e) => {
                        setCollege(e.target.value);
                        setDepartment('');
                      }}
                      className="h-13 w-full min-w-0 appearance-none rounded-xl bg-[#F6F8FA] px-5 pr-10 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none active:scale-[0.99] max-[640px]:h-12 max-[640px]:py-2 max-[640px]:pr-8 max-[640px]:pl-3 max-[640px]:text-[13px]"
                    >
                      <option value="">단과대 선택</option>
                      {colleges.map((college) => (
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
                      className="h-13 w-full min-w-0 appearance-none rounded-xl bg-[#F6F8FA] px-5 pr-10 text-[15px] text-[#2C2C2C] transition-all duration-150 outline-none active:scale-[0.99] disabled:text-[#B0B8C1] max-[640px]:h-12 max-[640px]:py-2 max-[640px]:pr-8 max-[640px]:pl-3 max-[640px]:text-[13px]"
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
                  disabled={isRegistering}
                  className="group mx-7.5 mb-7 cursor-pointer rounded-xl bg-[#5E92F0] px-5 py-3 text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1] sm:mx-auto sm:w-[25%] sm:min-w-22 sm:py-2.5"
                >
                  <span className="inline-flex items-center justify-center">
                    {REGISTER_TEXT.REGISTER_BUTTON}
                    {isRegistering ? (
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
              </>
            )}
          </form>
        </Card>
      </section>
      <PolicyModal type={openedPolicy} onClose={() => setOpenedPolicy(null)} />
    </main>
  );
}
function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
        checked
          ? 'border-[#5E92F0] bg-[#5E92F0] text-white'
          : 'border-[#C8CED6] bg-white text-transparent'
      }`}
    >
      <Check size={13} strokeWidth={3} />
    </span>
  );
}
function PolicyButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between px-5 py-3.5 text-left text-[14px] text-[#6B7684] transition-colors hover:bg-[#F3F5F7] hover:text-[#2C2C2C]"
    >
      <span>{label}</span>

      <div className="flex items-center gap-1 text-[12px] text-[#989898]">
        <span>보기</span>
        <ChevronRight size={17} />
      </div>
    </button>
  );
}
