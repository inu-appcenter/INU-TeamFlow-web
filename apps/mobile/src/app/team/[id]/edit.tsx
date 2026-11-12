import { useState } from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import TeamForm, { type TeamFormData } from "@/components/TeamForm";
import { isDefaultTeamImage } from "@/utils/image/isDefaultTeamImage";
import { getImageKeyFromUrl } from "@/utils/image/getImageKey";
import {
  useTeamDetail,
  useUpdateTeam,
  useDeleteTeam,
} from "@moimi/core/hooks/team/useTeamQuery";

// 기존 이미지는 전체 URL로 들어오므로 키만 뽑아서 보냄
// 새로 업로드한 이미지는 이미 키라서 그대로 사용
const toImageKey = (value: string) =>
  value.startsWith("http") ? getImageKeyFromUrl(value) : value;

export default function TeamEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team, isLoading } = useTeamDetail(teamId);
  const { mutateAsync: updateTeam } = useUpdateTeam();
  const { mutateAsync: deleteTeamMutate, isPending: isDeleting } =
    useDeleteTeam();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      await deleteTeamMutate(teamId);
      setIsDeleteConfirmOpen(false);
      // 팀 상세·수정 화면이 스택에 남지 않도록 전부 닫고 팀 목록으로
      // (push하면 뒤로가기 시 삭제된 팀의 수정 화면으로 돌아감)
      if (router.canDismiss()) router.dismissAll();
      router.replace("/team");
    } catch (err) {
      console.error("팀 삭제 실패", err);
      setIsDeleteConfirmOpen(false);
      showErrorMessage("팀 삭제에 실패했어요");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[13px] text-[#9C9C9C]">불러오는 중...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="font-semibold text-[#2C2C2C]">
          존재하지 않는 팀입니다.
        </Text>
      </View>
    );
  }

  const initialData: TeamFormData = {
    name: team.name,
    category: team.category,
    description: team.description,
    link: team.link ?? "",
    sns: team.sns ?? "",
    imageUrl:
      team.imageUrl && !isDefaultTeamImage(team.imageUrl) ? team.imageUrl : "",
  };

  // TeamForm이 에러 토스트를 띄우므로 실패는 throw로 넘김
  const handleSubmit = async (form: TeamFormData) => {
    await updateTeam({
      teamId,
      body: {
        name: form.name,
        category: form.category,
        description: form.description,
        link: form.link || undefined,
        sns: form.sns || undefined,
        imageKey: form.imageUrl ? toImageKey(form.imageUrl) : undefined,
      },
    });
    // 팀 상세로 돌아가기 (push하면 같은 상세가 스택에 하나 더 쌓임)
    // 팀 상세는 useRefreshOnFocus로 수정 내용을 다시 불러옴
    router.back();
  };

  return (
    <View className="flex-1">
      <TeamForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

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

      <Modal
        transparent
        visible={isDeleteConfirmOpen}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        }}
      >
        <Pressable
          onPress={() => {
            if (!isDeleting) setIsDeleteConfirmOpen(false);
          }}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white p-6"
          >
            <Text className="text-center text-[18px] font-bold text-[#2C2C2C]">
              팀을 삭제할까요?
            </Text>
            <Text className="mt-2 text-center text-[13px] text-[#989898]">
              삭제한 팀은 복구할 수 없어요
            </Text>
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                style={{ opacity: isDeleting ? 0.5 : 1 }}
                className="flex-1 items-center rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                style={{ opacity: isDeleting ? 0.6 : 1 }}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#E22222] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                {isDeleting && <ActivityIndicator size="small" color="#fff" />}
                <Text className="text-[14px] font-semibold text-white">
                  {isDeleting ? "삭제 중..." : "삭제"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
