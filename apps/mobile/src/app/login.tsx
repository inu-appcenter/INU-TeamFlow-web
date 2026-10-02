import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { isAxiosError } from "axios";
import { useLogin } from "@moimi/core/hooks/useAuthQuery";
import { LOGIN_TEXT } from "@moimi/core/constants/messages";
import { ROUTES } from "@moimi/core/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "react-native";

const LOGO = require("@/assets/images/logo.webp");

type LoginErrorBody = {
  code?: number;
  message?: string;
};

const INVALID_CREDENTIALS_MESSAGE = "아이디 또는 비밀번호가 올바르지 않습니다";
const SANCTIONED_FALLBACK_MESSAGE = "이용이 정지된 계정이에요";

// 403 = 정지/영구정지 계정 → 서버 메시지 그대로 노출
const getLoginError = (
  error: unknown
): { message: string; isSanctioned: boolean } => {
  if (!isAxiosError<LoginErrorBody>(error)) {
    return { message: INVALID_CREDENTIALS_MESSAGE, isSanctioned: false };
  }

  const status = error.response?.status;
  const body = error.response?.data;

  if (status === 403 || body?.code === 403) {
    return {
      message: body?.message ?? SANCTIONED_FALLBACK_MESSAGE,
      isSanctioned: true,
    };
  }

  return { message: INVALID_CREDENTIALS_MESSAGE, isSanctioned: false };
};

export default function LoginScreen() {
  const { login } = useAuth();
  const { mutate: loginMutate, isPending: isLoginPending } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  const handleSubmit = () => {
    if (isLoginPending) return;

    const trimmedUsername = username.trim();
    if (trimmedUsername === "") {
      showError("아이디를 입력해주세요");
      return;
    }
    if (password === "") {
      showError("비밀번호를 입력해주세요");
      return;
    }

    loginMutate(
      { username: trimmedUsername, password },
      {
        onSuccess: async (data) => {
          await login(data.accessToken);
          router.replace("/" as never); // 모바일은 (tabs) 그룹이 루트 경로라 "/main"이 아니라 "/"
        },
        onError: (error) => {
          const { message, isSanctioned } = getLoginError(error);
          showError(message);

          // 비밀번호가 틀린 경우에만 비움 (정지 계정은 비번 자체는 맞음)
          if (!isSanctioned) setPassword("");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center bg-[#F0F2F5] px-5"
    >
      {errorMessage && (
        <View className="absolute left-0 right-0 top-32 z-50 items-center px-6">
          <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
            <Text className="text-center text-sm font-semibold text-white">
              {errorMessage}
            </Text>
          </View>
        </View>
      )}
      <Image
        source={LOGO}
        style={{
          height: 30,
          width: 120,
          marginBottom: 25,
          marginTop: -20,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />

      <View className="rounded-3xl bg-white px-6 pb-8 pt-8 border-[0.5px] border-[#D6DDE5]">
        <Text className="mb-6 text-center text-[22px] font-bold text-[#2c2c2c]">
          {LOGIN_TEXT.TITLE}
        </Text>

        <View className="mb-1">
          <Text className="mx-7.5 mb-1 text-[12px] font-medium text-[#989898]">
            {LOGIN_TEXT.USERNAME_LABEL}
          </Text>
          <View className="mx-7.5 mb-4">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={LOGIN_TEXT.USERNAME_PLACEHOLDER}
              placeholderTextColor="#989898"
              autoCapitalize="none"
              className="h-[50px] w-full rounded-full bg-[#F6F8FA] px-5 text-[15px] text-[#2C2C2C]"
            />
          </View>
        </View>

        <View className="mb-1">
          <Text className="mx-7.5 mb-1 text-[12px] font-medium text-[#989898]">
            {LOGIN_TEXT.PASSWORD_LABEL}
          </Text>
          <View className="mx-7.5 mb-2">
            <View className="relative justify-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
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
        </View>

        <View className="mx-7.5 mb-6 flex-row flex-wrap items-center">
          <Text className="text-[13px] font-medium text-[#989898]">
            {LOGIN_TEXT.NO_ACCOUNT}
          </Text>
          <Pressable onPress={() => router.push(ROUTES.REGISTER as never)}>
            <Text className="text-[13px] font-semibold text-[#5E92F0]">
              {LOGIN_TEXT.REGISTER}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isLoginPending}
          className={`items-center self-center rounded-xl px-14 h-[42px] justify-center transition-transform duration-150 ease-out active:scale-90 ${
            isLoginPending ? "bg-[#B0B8C1]" : "bg-[#5E92F0]"
          }`}
        >
          <View className="flex-row items-center">
            <Text className="text-[15px] font-bold text-white">
              {LOGIN_TEXT.TITLE}
            </Text>
            {isLoginPending && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
