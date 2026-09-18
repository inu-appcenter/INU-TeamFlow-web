import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import PolicyContent from "./PolicyContent";
import {
  communityGuidelines,
  privacyPolicy,
  termsPolicy,
  youthProtectionPolicy,
} from "@moimi/core/constants/policies/index";
import type { PolicyDocument, PolicyType } from "@moimi/core/types/policy";

interface PolicyModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

const POLICY_MAP: Record<PolicyType, PolicyDocument> = {
  terms: termsPolicy,
  privacy: privacyPolicy,
  community: communityGuidelines,
  youth: youthProtectionPolicy,
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  const policy = type ? POLICY_MAP[type] : null;

  if (!policy) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        elevation: 999,
      }}
      className="items-center justify-center bg-black/40 px-4"
    >
      {/* 배경: 카드를 감싸지 않는 별도의 절대위치 레이어 */}
      <Pressable
        onPress={onClose}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* 카드: 배경의 자식이 아니라 형제. ScrollView가 Pressable 안에 안 갇힘 */}
      <View
        style={{ height: MODAL_HEIGHT }}
        className="relative w-full max-w-[500px] overflow-hidden rounded-2xl bg-white"
      >
        <View className="border-b-[0.5px] border-[#ECEFF2] px-6 py-4 pr-14">
          <Text className="text-[18px] font-semibold text-[#2C2C2C]">
            {policy.title}
          </Text>
          <Text className="mt-1 text-[12px] text-[#989898]">
            내용을 확인한 후 닫아주세요.
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <PolicyContent policy={policy} />
        </ScrollView>

        <View className="border-t-[0.5px] border-[#ECEFF2] px-6 py-4">
          <Pressable
            onPress={onClose}
            className="items-center rounded-xl bg-[#5E92F0] py-3.5 transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <Text className="text-[15px] font-semibold text-white">확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
