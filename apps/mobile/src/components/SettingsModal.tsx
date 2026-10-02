import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { X } from "lucide-react-native";
import { useDeleteUser, useMyProfile } from "@moimi/core/hooks/useUserQuery";
import { getHttpStatus } from "@/utils/etc/httpError";
import NotificationSettings from "@/components/NotificationSettings";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  showErrorMessage: (message: string) => void;
  onDeleted: () => void;
};

export default function SettingsModal({
  visible,
  onClose,
  showErrorMessage,
  onDeleted,
}: SettingsModalProps) {
  const { data: profileData } = useMyProfile();
  const { mutateAsync: deleteUser, isPending: isDeleteUserPending } =
    useDeleteUser();

  const [hasUnsavedNotificationChanges, setHasUnsavedNotificationChanges] =
    useState(false);
  const [isSettingsCloseConfirmOpen, setIsSettingsCloseConfirmOpen] =
    useState(false);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const requestClose = () => {
    if (hasUnsavedNotificationChanges) {
      setIsSettingsCloseConfirmOpen(true);
      return;
    }
    onClose();
  };

  const openDeleteUserConfirm = () => {
    setDeleteConfirmText("");
    setIsDeleteUserConfirmOpen(true);
  };

  const closeDeleteUserConfirm = () => {
    if (isDeleteUserPending) return;
    setDeleteConfirmText("");
    setIsDeleteUserConfirmOpen(false);
  };

  const handleDeleteUser = async () => {
    if (isDeleteUserPending) return;
    try {
      await deleteUser();
      onDeleted();
    } catch (error) {
      const status = getHttpStatus(error);
      if (status === 403) {
        showErrorMessage(
          "팀장 권한을 보유하고 있거나 진행 중인 투표가 있어 탈퇴할 수 없어요"
        );
        return;
      }
      showErrorMessage("회원 탈퇴에 실패했어요");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={requestClose}
    >
      <View className="flex-1 bg-[#F0F2F5]">
        <View
          style={{ paddingTop: 60 }}
          className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] bg-white px-6 pb-4"
        >
          <Text className="text-[20px] font-bold text-[#2C2C2C]">설정</Text>
          <Pressable
            onPress={requestClose}
            className="h-9 w-9 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90"
          >
            <X size={22} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <NotificationSettings
            showErrorMessage={showErrorMessage}
            onDirtyChange={setHasUnsavedNotificationChanges}
          />

          <View className="mb-3">
            <Text className="text-[18px] font-bold text-[#2C2C2C]">
              계정 관리
            </Text>
            <Text className="text-[14px] leading-6 text-[#989898]">
              계정과 관련된 설정을 관리할 수 있어요
            </Text>
          </View>

          <View className="rounded-3xl border border-[#FFD3D3] bg-white p-5">
            <Text className="text-[17px] font-bold text-[#E22222]">
              회원 탈퇴
            </Text>
            <Text className="mt-2 text-[12px] leading-6 text-[#989898]">
              탈퇴하면 계정과 관련된 정보가 삭제되며 복구할 수 없습니다
            </Text>
            <Text className="text-[12px] leading-6 text-[#989898]">
              팀장 권한을 보유하고 있거나 진행 중인 투표가 있으면 탈퇴할 수
              없습니다
            </Text>

            <Pressable
              onPress={openDeleteUserConfirm}
              className=" items-center self-end rounded-xl border-[0.5px] border-[#FFD3D3] bg-[#FFF5F5] px-6 py-3  transition-transform duration-150 ease-out active:scale-95"
            >
              <Text className="text-[14px] font-semibold text-[#E22222]">
                탈퇴하기
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {isDeleteUserConfirmOpen && (
          <Pressable
            onPress={closeDeleteUserConfirm}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 300,
            }}
            className="items-center justify-center bg-black/45 px-6"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] rounded-3xl bg-white p-6"
            >
              <Text className="text-center text-xl font-bold text-[#2C2C2C]">
                정말 탈퇴할까요
              </Text>
              <Text className="text-center text-[12px] leading-6 text-[#989898]">
                탈퇴한 계정과 관련된 정보는 복구할 수 없습니다
              </Text>

              <View className="mt-2 rounded-2xl bg-[#FBFBFB] p-4">
                <Text className="text-[13px] leading-5 text-[#666666]">
                  계속하려면 아래 입력창에{" "}
                  <Text className="font-bold text-[#2C2C2C]">
                    {profileData?.username}
                  </Text>
                  을 정확히 입력해주세요
                </Text>

                <TextInput
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  editable={!isDeleteUserPending}
                  placeholder={profileData?.username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  className="mt-3 rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-4 py-3 text-[14px] text-[#2C2C2C]"
                />
              </View>

              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={closeDeleteUserConfirm}
                  disabled={isDeleteUserPending}
                  style={{ opacity: isDeleteUserPending ? 0.5 : 1 }}
                  className="flex-1 items-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-[#2C2C2C]">취소</Text>
                </Pressable>

                <Pressable
                  onPress={handleDeleteUser}
                  disabled={
                    isDeleteUserPending ||
                    deleteConfirmText !== profileData?.username
                  }
                  style={{
                    opacity:
                      isDeleteUserPending ||
                      deleteConfirmText !== profileData?.username
                        ? 0.5
                        : 1,
                  }}
                  className="flex-1 items-center rounded-xl bg-[#E22222] py-4 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-white">
                    {isDeleteUserPending ? "탈퇴 중..." : "탈퇴"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        )}

        {isSettingsCloseConfirmOpen && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 400,
            }}
            className="items-center justify-center bg-black/45 px-6"
          >
            <View className="w-full max-w-[400px] rounded-3xl bg-white p-6">
              <Text className="text-center text-xl font-bold text-[#2C2C2C]">
                변경사항이 저장되지 않았어요
              </Text>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={() => setIsSettingsCloseConfirmOpen(false)}
                  className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-[#2C2C2C]">
                    계속 수정
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsSettingsCloseConfirmOpen(false);
                    setHasUnsavedNotificationChanges(false);
                    onClose();
                  }}
                  className="flex-1 items-center rounded-xl bg-[#E22222] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-white">
                    저장하지 않고 닫기
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
