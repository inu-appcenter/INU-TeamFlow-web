import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Linking, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { BellOff } from "lucide-react-native";
import { registerPushToken } from "@/lib/pushNotifications";

type PermissionState = "granted" | "undetermined" | "denied" | null;

/**
 * 기기 알림 권한이 꺼져 있으면 안내
 * - 서비스 알림 설정이 켜져 있어도 기기 권한이 없으면 푸시가 오지 않음
 * - iOS는 한 번 거부하면 앱에서 다시 물어볼 수 없어서 설정 화면으로 보냄
 */
export default function PushPermissionBanner() {
  const [permission, setPermission] = useState<PermissionState>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermission(status as PermissionState);
    return status;
  }, []);

  useEffect(() => {
    if (!Device.isDevice) return;

    void checkPermission();

    // 설정 앱에서 권한을 켜고 돌아오면 다시 확인 → 허용됐으면 토큰 등록
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      const before = permission;
      const status = await checkPermission();
      if (status === "granted" && before !== "granted") {
        registerPushToken().catch((error) =>
          console.error("[push] 등록 실패:", error)
        );
      }
    });

    return () => subscription.remove();
  }, [checkPermission, permission]);

  const handleAllow = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      // 권한 요청 + 허용 시 서버 등록까지
      await registerPushToken();
    } catch (error) {
      console.error("[push] 등록 실패:", error);
    } finally {
      await checkPermission();
      setIsRequesting(false);
    }
  };

  // 시뮬레이터, 확인 전, 허용된 상태에서는 안 보임
  if (!Device.isDevice || permission === null || permission === "granted") {
    return null;
  }

  const isDenied = permission === "denied";

  return (
    <View className="mb-5 rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFE8E8]">
          <BellOff size={18} strokeWidth={2.5} color="#E75A5A" />
        </View>

        <Text className="text-[16px] font-semibold text-[#2C2C2C]">
          {isDenied ? "기기 알림이 꺼져 있어요" : "기기 알림을 허용해주세요"}
        </Text>
      </View>

      <Text className="mt-2 text-[13px] leading-5 text-[#989898]">
        {isDenied
          ? "아래 알림을 켜도 기기에서 꺼져 있으면 받을 수 없어요.\n설정에서 모이미 알림을 허용해주세요."
          : "알림을 허용해야 팀 공지, 채팅, 일정 알림을 받을 수 있어요."}
      </Text>

      <Pressable
        onPress={isDenied ? () => Linking.openSettings() : handleAllow}
        disabled={isRequesting}
        style={{ opacity: isRequesting ? 0.5 : 1 }}
        className="mt-2 items-center self-end rounded-xl bg-[#5E92F0] px-5 py-3 transition-transform duration-150 ease-out active:scale-95"
      >
        <Text className="text-[14px] font-semibold text-white">
          {isDenied ? "설정 열기" : isRequesting ? "확인 중..." : "알림 허용"}
        </Text>
      </Pressable>
    </View>
  );
}
