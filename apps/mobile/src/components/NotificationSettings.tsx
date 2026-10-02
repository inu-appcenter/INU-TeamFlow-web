import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
} from "react-native";
import { BellRing } from "lucide-react-native";
import {
  useNotificationOptions,
  useUpdateNotificationOptions,
} from "@moimi/core/hooks/useNotificationOptionQuery";
import { notificationItems } from "@moimi/core/constants/notificationOption";
import type {
  NotificationOptionRequest,
  NotificationToggleProps,
} from "@moimi/core/types/notificationOption";

type NotificationSettingsProps = {
  showErrorMessage: (message: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function NotificationToggle({
  checked,
  disabled = false,
  onChange,
  label,
}: NotificationToggleProps) {
  const translateX = useRef(new Animated.Value(checked ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: checked ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [checked, translateX]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{
        opacity: disabled ? 0.6 : 1,
        width: 48,
        height: 28,
        borderRadius: 14,
      }}
      className={checked ? "bg-[#5E92F0]" : "bg-[#D9DEE7]"}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          transform: [{ translateX }],
        }}
      />
    </Pressable>
  );
}

export default function NotificationSettings({
  showErrorMessage,
  onDirtyChange,
}: NotificationSettingsProps) {
  const {
    data: notificationOptions,
    isLoading,
    isError,
  } = useNotificationOptions();

  const { mutate: updateNotificationOptions, isPending } =
    useUpdateNotificationOptions();

  const [draft, setDraft] = useState<NotificationOptionRequest | null>(null);

  const serverOptions: NotificationOptionRequest | null = notificationOptions
    ? {
        noticeEnabled: notificationOptions.noticeEnabled,
        inviteEnabled: notificationOptions.inviteEnabled,
        applicationEnabled: notificationOptions.applicationEnabled,
        calendarEnabled: notificationOptions.calendarEnabled,
        chatEnabled: notificationOptions.chatEnabled,
      }
    : null;

  const currentOptions = draft ?? serverOptions;

  const allEnabled = !!(
    currentOptions &&
    currentOptions.noticeEnabled &&
    currentOptions.inviteEnabled &&
    currentOptions.applicationEnabled &&
    currentOptions.calendarEnabled &&
    currentOptions.chatEnabled
  );

  const isDirty =
    draft !== null &&
    serverOptions !== null &&
    (draft.noticeEnabled !== serverOptions.noticeEnabled ||
      draft.inviteEnabled !== serverOptions.inviteEnabled ||
      draft.applicationEnabled !== serverOptions.applicationEnabled ||
      draft.calendarEnabled !== serverOptions.calendarEnabled ||
      draft.chatEnabled !== serverOptions.chatEnabled);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleAllToggle = (enabled: boolean) => {
    setDraft({
      noticeEnabled: enabled,
      inviteEnabled: enabled,
      applicationEnabled: enabled,
      calendarEnabled: enabled,
      chatEnabled: enabled,
    });
  };

  const handleOptionToggle = (
    key: keyof NotificationOptionRequest,
    enabled: boolean
  ) => {
    if (!currentOptions) return;
    setDraft({ ...currentOptions, [key]: enabled });
  };

  const handleCancel = () => setDraft(null);

  const handleSave = () => {
    if (!draft || !isDirty || isPending) return;
    updateNotificationOptions(draft, {
      onError: () => showErrorMessage("알림 설정 저장에 실패했어요"),
    });
  };

  if (isError) {
    return (
      <View className="mb-6">
        <Text className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</Text>
        <View className="mt-4 min-h-[180px] items-center justify-center rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white">
          <Text className="text-[14px] text-[#989898]">
            알림 설정을 불러오지 못했어요
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading || !currentOptions) {
    return (
      <View className="mb-6">
        <Text className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</Text>
        <Text className="mt-1 text-[14px] leading-6 text-[#989898]">
          받고 싶은 알림을 선택할 수 있어요
        </Text>
        <View className="mt-4 min-h-[180px] items-center justify-center rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white">
          <ActivityIndicator size="small" color="#9C9C9C" />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</Text>
      <Text className="mt-1 text-[14px] leading-6 text-[#989898]">
        받고 싶은 알림을 선택할 수 있어요
      </Text>

      <View className="mt-4 rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F1FF]">
              <BellRing size={19} color="#5E92F0" />
            </View>
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-[#2C2C2C]">
                전체 알림
              </Text>
            </View>
          </View>

          <NotificationToggle
            label="전체 알림"
            checked={allEnabled}
            onChange={handleAllToggle}
          />
        </View>

        <View className="mt-5 border-t border-[#EEF1F5]" />

        <View>
          {notificationItems.map((item, index) => (
            <View
              key={item.key}
              className={`flex-row items-center justify-between gap-4 py-4 ${
                index !== notificationItems.length - 1
                  ? "border-b border-[#F0F2F5]"
                  : ""
              }`}
            >
              <View className="flex-1">
                <Text className="text-[15px] font-medium text-[#2C2C2C]">
                  {item.title}
                </Text>
                <Text className="mt-1 text-[13px] text-[#989898]">
                  {item.description}
                </Text>
              </View>

              <NotificationToggle
                label={item.title}
                checked={currentOptions[item.key]}
                onChange={(enabled) => handleOptionToggle(item.key, enabled)}
              />
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 border-t border-[#EEF1F5] pt-4">
          <Pressable
            onPress={handleCancel}
            disabled={!isDirty || isPending}
            style={{ opacity: !isDirty || isPending ? 0.5 : 1 }}
            className="flex-1 items-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <Text className="text-[14px] font-semibold text-[#2C2C2C]">
              취소
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={!isDirty || isPending}
            style={{ opacity: !isDirty || isPending ? 0.5 : 1 }}
            className="flex-1 items-center rounded-xl bg-[#5E92F0] py-4 transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <Text className="text-[14px] font-semibold text-white">완료</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
