import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useLogin, useSignup } from "@moimi/core/hooks/useAuthQuery";
import { useCreateNotificationOptions } from "@moimi/core/hooks/useNotificationOptionQuery";
import { colleges } from "@moimi/core/constants/departments";
import { MESSAGES, REGISTER_TEXT } from "@moimi/core/constants/messages";
import { ROUTES } from "@moimi/core/constants/routes";
import type { PolicyType } from "@moimi/core/types/policy";
import { useAuth } from "@/contexts/AuthContext";
import SelectField from "@/components/SelectField";
import PolicyModal from "@/components/PolicyModal";

type RegisterStep = "terms" | "account" | "profile";
const STEP_ORDER: RegisterStep[] = ["terms", "account", "profile"];

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: checked ? 0 : 1,
        borderColor: "#C8CED6",
        backgroundColor: checked ? "#5E92F0" : "#fff",
      }}
    >
      {checked && <Check size={12} strokeWidth={3} color="#fff" />}
    </View>
  );
}

function StepDot({
  index,
  label,
  reached,
}: {
  index: number;
  label: string;
  reached: boolean;
}) {
  return (
    <View className="items-center gap-2">
      <View
        className={`h-7 w-7 items-center justify-center rounded-full ${
          reached ? "bg-[#5E92F0]" : "bg-[#E5E8EB]"
        }`}
      >
        <Text
          className={`text-[13px] font-semibold ${
            reached ? "text-white" : "text-[#989898]"
          }`}
        >
          {index}
        </Text>
      </View>
      <Text
        className={`text-[11px] font-medium ${
          reached ? "text-[#5E92F0]" : "text-[#989898]"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function StepLine({ active }: { active: boolean }) {
  return (
    <View
      className={`mx-2 mb-6 h-0.5 flex-1 ${
        active ? "bg-[#5E92F0]" : "bg-[#E5E8EB]"
      }`}
    />
  );
}

export default function RegisterScreen() {
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState<RegisterStep>("terms");
  const currentStepIndex = STEP_ORDER.indexOf(step);

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [openedPolicy, setOpenedPolicy] = useState<PolicyType | null>(null);

  const { mutateAsync: signupMutateAsync, isPending: isSignupPending } =
    useSignup();
  const { mutateAsync: loginMutateAsync, isPending: isLoginPending } =
    useLogin();
  const {
    mutateAsync: createNotificationOptionsMutateAsync,
    isPending: isNotificationPending,
  } = useCreateNotificationOptions();
  const isRegistering =
    isSignupPending || isLoginPending || isNotificationPending;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCheckPassword = checkPassword.length > 0;
  const isPasswordMatched = password === checkPassword;
  const currentCollege = colleges.find((item) => item.id === college);
  const isRequiredAgreed = agreedTerms && confirmedAge;
  const isAllAgreed = agreedTerms && confirmedAge && notificationEnabled;

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  const handleAllAgreement = () => {
    const next = !isAllAgreed;
    setAgreedTerms(next);
    setConfirmedAge(next);
    setNotificationEnabled(next);
  };

  const handleBack = () => {
    if (step === "profile") {
      setStep("account");
      return;
    }
    if (step === "account") {
      setStep("terms");
      return;
    }
    router.back();
  };

  const isEmpty = (v: string) => v.trim() === "";
  const hasEmptyField = () =>
    [username, password, checkPassword, email, name, college, department].some(
      isEmpty
    );

  const handleGoToAccount = () => {
    if (!isRequiredAgreed) {
      showError("필수 항목에 동의해주세요");
      return;
    }
    setStep("account");
  };

  const handleGoToProfile = () => {
    if ([username, password, checkPassword].some(isEmpty)) {
      showError(MESSAGES.REGISTER.EMPTY_FIELD);
      return;
    }
    if (password !== checkPassword) {
      showError(MESSAGES.REGISTER.PASSWORD_MISMATCH);
      return;
    }
    setStep("profile");
  };

  const handleSubmit = async () => {
    if (isRegistering) return;

    if (hasEmptyField()) {
      showError(MESSAGES.REGISTER.EMPTY_FIELD);
      return;
    }
    if (password !== checkPassword) {
      showError(MESSAGES.REGISTER.PASSWORD_MISMATCH);
      return;
    }

    const trimmedUsername = username.trim();

    try {
      await signupMutateAsync({
        username: trimmedUsername,
        password,
        email: email.trim(),
        name: name.trim(),
        department,
        imageKey: null,
      });
    } catch {
      showError(
        "이미 사용 중인 아이디 또는 이메일이거나 입력 정보가 올바르지 않습니다"
      );
      return;
    }

    try {
      const loginResponse = await loginMutateAsync({
        username: trimmedUsername,
        password,
      });
      await authLogin(loginResponse.accessToken);
    } catch {
      showError("회원가입 완료! 로그인 후 이용해주세요");
      router.replace(ROUTES.LOGIN as never);
      return;
    }

    try {
      await createNotificationOptionsMutateAsync({
        noticeEnabled: notificationEnabled,
        inviteEnabled: notificationEnabled,
        applicationEnabled: notificationEnabled,
        calendarEnabled: notificationEnabled,
        chatEnabled: notificationEnabled,
      });
    } catch (err) {
      console.error("초기 알림 설정 실패:", err);
    }

    router.replace("/" as never);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F0F2F5]"
    >
      {errorMessage && (
        <View className="absolute left-0 right-0 top-32 z-50 items-center">
          <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
            <Text className="text-sm font-semibold text-white">
              {errorMessage}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-5 pt-8"
      >
        <View className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white px-6 pb-8 pt-6">
          <View className="mb-2 mt-2 flex-row items-center justify-center">
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              className="absolute left-0 h-8 w-8 items-center justify-center"
            >
              <ChevronLeft size={22} strokeWidth={2.5} color="#9c9c9c" />
            </Pressable>
            <Text className="text-[22px] font-bold text-[#2c2c2c]">
              {REGISTER_TEXT.TITLE}
            </Text>
          </View>

          {/* 스텝 인디케이터 */}
          <View className="mx-auto mb-6 mt-4 w-full max-w-[300px] flex-row items-center px-2">
            <StepDot
              index={1}
              label="약관 동의"
              reached={currentStepIndex >= 0}
            />
            <StepLine active={currentStepIndex >= 1} />
            <StepDot
              index={2}
              label="계정 정보"
              reached={currentStepIndex >= 1}
            />
            <StepLine active={currentStepIndex >= 2} />
            <StepDot
              index={3}
              label="프로필 입력"
              reached={currentStepIndex >= 2}
            />
          </View>

          {step === "terms" && (
            <View>
              <View className="mb-3">
                <Text className="mb-1 text-center text-[16px] font-semibold text-[#2C2C2C]">
                  모이미 이용을 위해 약관을 확인해주세요
                </Text>
                <Text className="text-center text-[11px] text-[#989898]">
                  필수 항목에 동의하면 다음 단계로 이동할 수 있어요
                </Text>
              </View>

              <Pressable
                onPress={handleAllAgreement}
                className="mb-3 flex-row items-center gap-3 rounded-xl bg-[#F6F8FA] px-5 py-3 active:opacity-70"
              >
                <CheckCircle checked={isAllAgreed} />
                <Text className="font-semibold text-[#2C2C2C]">전체 동의</Text>
              </Pressable>

              <View className="overflow-hidden rounded-xl border-[0.5px] border-[#ECEFF2]">
                <View className="flex-row items-center px-4 py-3">
                  <Pressable
                    onPress={() => setAgreedTerms((prev) => !prev)}
                    className="min-w-0 flex-1 flex-row items-center gap-3"
                  >
                    <CheckCircle checked={agreedTerms} />
                    <Text className="text-[13px] text-[#4E5968]">
                      <Text className="mr-2 font-medium text-[#5E92F0]">
                        필수{" "}
                      </Text>
                      서비스 이용약관 동의
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOpenedPolicy("terms")}
                    hitSlop={8}
                    className="p-1"
                  >
                    <ChevronRight size={18} color="#B0B8C1" />
                  </Pressable>
                </View>

                <View className="mx-5 h-[0.5px] bg-[#D6DDE5]/60" />

                <Pressable
                  onPress={() => setConfirmedAge((prev) => !prev)}
                  className="flex-row items-center gap-3 px-4 py-3"
                >
                  <CheckCircle checked={confirmedAge} />
                  <Text className="text-[13px] text-[#4E5968]">
                    <Text className="mr-2 font-medium text-[#5E92F0]">
                      필수{" "}
                    </Text>
                    본인은 만 14세 이상입니다
                  </Text>
                </Pressable>

                <View className="mx-5 h-[0.5px] bg-[#D6DDE5]/60" />

                <Pressable
                  onPress={() => setNotificationEnabled((prev) => !prev)}
                  className="flex-row items-center gap-3 px-4 py-3"
                >
                  <CheckCircle checked={notificationEnabled} />
                  <Text className="text-[13px] text-[#4E5968]">
                    <Text className="mr-2 font-medium text-[#989898]">
                      선택{" "}
                    </Text>
                    서비스 알림 받기
                  </Text>
                </Pressable>
              </View>

              <Text className="mt-2 px-1 text-[11px] leading-5 text-[#989898]">
                알림별 수신 여부는 가입 후 알림 설정에서 언제든 변경할 수 있어요
              </Text>

              <View className="mt-4">
                <Text className="mb-2 px-1 text-[11px] font-medium text-[#989898]">
                  서비스 정책
                </Text>

                <View className="overflow-hidden rounded-xl bg-[#F9FAFB]">
                  <PolicyButton
                    label="개인정보 처리방침"
                    onPress={() => setOpenedPolicy("privacy")}
                  />
                  <View className="mx-5 h-[0.5px] bg-[#D6DDE5]" />
                  <PolicyButton
                    label="커뮤니티 이용규칙"
                    onPress={() => setOpenedPolicy("community")}
                  />
                  <View className="mx-5 h-[0.5px] bg-[#D6DDE5]" />
                  <PolicyButton
                    label="청소년 보호정책"
                    onPress={() => setOpenedPolicy("youth")}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleGoToAccount}
                disabled={!isRequiredAgreed}
                className={`mt-8 items-center self-center rounded-xl px-14 h-[42px] justify-center transition-transform duration-150 ease-out active:scale-90 ${
                  isRequiredAgreed ? "bg-[#5E92F0]" : "bg-[#B0B8C1]"
                }`}
              >
                <Text className="text-[15px] font-semibold text-white">
                  다음
                </Text>
              </Pressable>
            </View>
          )}

          {step === "account" && (
            <View>
              <View className="mb-1 mt-2">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  {REGISTER_TEXT.USERNAME_LABEL}
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={REGISTER_TEXT.USERNAME_PLACEHOLDER}
                  placeholderTextColor="#989898"
                  autoCapitalize="none"
                  className="mb-4 h-[50px] w-full rounded-full bg-[#F6F8FA] px-5 text-[15px] text-[#2C2C2C]"
                />
              </View>

              <View className="mb-5">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  {REGISTER_TEXT.PASSWORD_LABEL}
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={REGISTER_TEXT.PASSWORD_PLACEHOLDER}
                    placeholderTextColor="#989898"
                    secureTextEntry={!isPasswordVisible}
                    className="h-[50px] w-full rounded-full bg-[#F6F8FA] pl-5 pr-14 text-[15px] text-[#2C2C2C]"
                  />
                  <Pressable
                    onPress={() => setIsPasswordVisible((prev) => !prev)}
                    className="absolute right-5 h-6 w-6 items-center justify-center"
                    hitSlop={8}
                  >
                    {isPasswordVisible ? (
                      <Eye size={20} color="#989898" />
                    ) : (
                      <EyeOff size={20} color="#989898" />
                    )}
                  </Pressable>
                </View>
              </View>

              <View className="mb-5">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  {REGISTER_TEXT.CHECK_PASSWORD_LABEL}
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    value={checkPassword}
                    onChangeText={setCheckPassword}
                    placeholder={REGISTER_TEXT.CHECK_PASSWORD_PLACEHOLDER}
                    placeholderTextColor="#989898"
                    secureTextEntry={!isCheckPasswordVisible}
                    className="h-[50px] w-full rounded-full bg-[#F6F8FA] pl-5 pr-14 text-[15px] text-[#2C2C2C]"
                  />
                  <Pressable
                    onPress={() => setIsCheckPasswordVisible((prev) => !prev)}
                    className="absolute right-5 h-6 w-6 items-center justify-center"
                    hitSlop={8}
                  >
                    {isCheckPasswordVisible ? (
                      <Eye size={20} color="#989898" />
                    ) : (
                      <EyeOff size={20} color="#989898" />
                    )}
                  </Pressable>
                </View>

                {hasCheckPassword && (
                  <View className="mx-1 mt-2 flex-row items-center">
                    <View
                      className={`mr-2 h-5 w-5 items-center justify-center rounded-full ${
                        isPasswordMatched ? "bg-[#E8F7F0]" : "bg-[#FDECEC]"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-bold ${
                          isPasswordMatched
                            ? "text-[#22A06B]"
                            : "text-[#E22222]"
                        }`}
                      >
                        {isPasswordMatched ? "✓" : "!"}
                      </Text>
                    </View>
                    <Text
                      className={`text-[12px] font-medium ${
                        isPasswordMatched ? "text-[#22A06B]" : "text-[#E22222]"
                      }`}
                    >
                      {isPasswordMatched
                        ? "비밀번호가 일치해요"
                        : "비밀번호가 일치하지 않아요"}
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleGoToProfile}
                className="mt-6 items-center self-center rounded-xl bg-[#5E92F0] px-14 h-[42px] justify-center transition-transform duration-150 ease-out active:scale-90"
              >
                <Text className="text-[15px] font-semibold text-white">
                  다음
                </Text>
              </Pressable>
            </View>
          )}

          {step === "profile" && (
            <View>
              <View className="mb-1">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  {REGISTER_TEXT.NAME_LABEL}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={REGISTER_TEXT.NAME_PLACEHOLDER}
                  placeholderTextColor="#989898"
                  className="mb-4 h-[50px] w-full rounded-full bg-[#F6F8FA] px-5 text-[15px] text-[#2C2C2C]"
                />
              </View>

              <View className="mb-1">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  {REGISTER_TEXT.EMAIL_LABEL}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={REGISTER_TEXT.EMAIL_PLACEHOLDER}
                  placeholderTextColor="#989898"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="mb-4 h-[50px] w-full rounded-full bg-[#F6F8FA] px-5 text-[15px] text-[#2C2C2C]"
                />
              </View>

              <View className="mb-5">
                <Text className="mx-1 mb-1 text-[12px] font-medium text-[#989898]">
                  학과
                </Text>
                <View className="mb-2">
                  <SelectField
                    value={college}
                    onChange={(value) => {
                      setCollege(value);
                      setDepartment("");
                    }}
                    options={colleges.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    placeholder="단과대 선택"
                  />
                </View>
                <SelectField
                  value={department}
                  onChange={setDepartment}
                  options={
                    currentCollege?.departments.map((d) => ({
                      label: d.note ? `${d.name} ${d.note}` : d.name,
                      value: d.value,
                    })) ?? []
                  }
                  placeholder="학과 선택"
                  disabled={!college}
                />
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={isRegistering}
                className={`mt-4 items-center self-center rounded-xl px-14 h-[42px] justify-center transition-transform duration-150 ease-out active:scale-90 ${
                  isRegistering ? "bg-[#B0B8C1]" : "bg-[#5E92F0]"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-[15px] font-bold text-white">
                    {REGISTER_TEXT.REGISTER_BUTTON}
                  </Text>
                  {isRegistering && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <PolicyModal type={openedPolicy} onClose={() => setOpenedPolicy(null)} />
    </KeyboardAvoidingView>
  );
}

function PolicyButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-3.5 active:bg-[#F3F5F7]"
    >
      <Text className="text-[12px] text-[#6B7684]">{label}</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-[11px] text-[#989898]">보기</Text>
        <ChevronRight size={15} color="#989898" />
      </View>
    </Pressable>
  );
}
