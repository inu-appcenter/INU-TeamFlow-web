import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { isAxiosError } from "axios";
import { useLogin } from "@moimi/core/hooks/useAuthQuery";
import { LOGIN_TEXT } from "@moimi/core/constants/messages";
import { ROUTES } from "@moimi/core/constants/routes";
import { useAuth } from "@/contexts/AuthContext";

// 키보드가 올라왔을 때 카드 아래와 키보드 사이 간격
const KEYBOARD_GAP = 24;

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

  // 아이디 입력에서 "다음" → 비밀번호 칸으로 이동
  const passwordInputRef = useRef<TextInput>(null);

  // 키보드가 카드를 가리는 만큼만 카드를 위로 올림 (가운데 정렬 유지)
  const cardBottomRef = useRef(0); // 이동 전 카드 아래쪽 위치
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      const keyboardTop = e.endCoordinates.screenY;
      const overlap = cardBottomRef.current + KEYBOARD_GAP - keyboardTop;
      Animated.timing(translateY, {
        toValue: overlap > 0 ? -overlap : 0,
        duration: e.duration || 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardWillHide", (e) => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: e.duration || 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  const handleSubmit = () => {
    if (isLoginPending) return;

    // 에러 토스트가 키보드에 가려지지 않도록 먼저 내림
    Keyboard.dismiss();

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
          await login(data.accessToken, data.refreshToken);
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
    // 입력 칸 바깥(배경)을 누르면 키보드 내림
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center bg-[#F0F2F5] px-5">
        {errorMessage && (
          <View className="absolute left-0 right-0 top-32 z-50 items-center px-6">
            <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
              <Text className="text-center text-sm font-semibold text-white">
                {errorMessage}
              </Text>
            </View>
          </View>
        )}

        <Animated.View
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            cardBottomRef.current = y + height;
          }}
          style={{ transform: [{ translateY }] }}
          className="rounded-3xl bg-white px-6 pb-8 pt-8 border-[0.5px] border-[#D6DDE5]"
        >
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
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                className="h-[50px] w-full rounded-xl bg-[#F6F8FA] px-5 text-[15px] text-[#2C2C2C] transition-transform duration-150 ease-out active:scale-95"
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
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={LOGIN_TEXT.PASSWORD_PLACEHOLDER}
                  placeholderTextColor="#989898"
                  secureTextEntry={!isPasswordVisible}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  className="h-[50px] w-full rounded-xl bg-[#F6F8FA] pl-5 pr-14 text-[15px] text-[#2C2C2C] transition-transform duration-150 ease-out active:scale-95"
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
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}
