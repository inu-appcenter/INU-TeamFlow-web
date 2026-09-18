import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useVerifySchool } from "@moimi/core/hooks/useAuthQuery";

const INU_LOGO = require("@/assets/images/inu-logo.png");

export default function SchoolAuthenticationScreen() {
  const [studentNumber, setStudentNumber] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: verifySchoolMutate, isPending } = useVerifySchool();

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handleVerifySchool = () => {
    if (isPending) return;

    if (studentNumber.trim() === "" || portalPassword.trim() === "") {
      showErrorMessage("학번과 비밀번호를 입력해주세요");
      return;
    }

    verifySchoolMutate(
      { studentNumber, portalPassword },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          showErrorMessage("학교 인증에 실패했습니다");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F2F5]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {errorMessage ? (
        <View
          style={{
            position: "absolute",
            top: 120,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">학교 인증</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 120,
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 items-center">
          <Image
            source={INU_LOGO}
            style={{ height: 40, width: 160 }}
            resizeMode="contain"
          />
        </View>
        <View className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white px-6 py-6">
          <View className="mb-6 items-center">
            <Text className="text-[20px] font-semibold text-[#2C2C2C]">
              학교 인증
            </Text>
            <Text className="mt-1.5 text-[13px] text-[#989898]">
              인천대학교 포털 계정으로 본인 인증을 진행해요
            </Text>
          </View>

          <Text className="mb-1 text-[13px] font-medium text-[#989898]">
            학번
          </Text>
          <TextInput
            value={studentNumber}
            onChangeText={setStudentNumber}
            placeholder="학번을 입력하세요"
            placeholderTextColor="#B0B8C1"
            keyboardType="number-pad"
            className="mb-4 h-12 rounded-full  bg-[#F6F8FA] px-5 text-[#2C2C2C]"
          />

          <Text className="mb-1 text-[13px] font-medium text-[#989898]">
            비밀번호
          </Text>
          <View className="mb-4 flex-row items-center rounded-full  bg-[#F6F8FA] pr-3">
            <TextInput
              value={portalPassword}
              onChangeText={setPortalPassword}
              placeholder="포털 비밀번호를 입력하세요"
              placeholderTextColor="#B0B8C1"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              className="flex-1 px-5 h-12 text-[#2C2C2C]"
            />
            <Pressable
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              className="p-1 active:opacity-70"
            >
              {isPasswordVisible ? (
                <Eye size={18} color="#989898" />
              ) : (
                <EyeOff size={18} color="#989898" />
              )}
            </Pressable>
          </View>

          <Text className="mb-2 text-center text-[11px] leading-5 text-[#B0B0B0]">
            입력한 정보는 학교 인증 목적으로만 사용됩니다
          </Text>

          <Pressable
            onPress={handleVerifySchool}
            disabled={isPending}
            style={{ opacity: isPending ? 0.6 : 1 }}
            className="items-center rounded-xl bg-[#5E92F0] py-4 active:scale-95"
          >
            <Text className="text-[15px] font-semibold text-white">
              {isPending ? "인증 중..." : "인증하기"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
