import { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import TeamForm, { type TeamFormData } from "@/components/TeamForm";
import { isDefaultTeamImage } from "@/utils/image/isDefaultTeamImage";
import {
  useTeamDetail,
  useUpdateTeam,
  useDeleteTeam,
} from "@moimi/core/hooks/team/useTeamQuery";

export default function TeamEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team, isLoading } = useTeamDetail(teamId);
  const { mutateAsync: updateTeam } = useUpdateTeam();
  const { mutateAsync: deleteTeamMutate } = useDeleteTeam();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTeamMutate(teamId);
      router.push("/team");
    } catch (err) {
      console.error("팀 삭제 실패", err);
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

  const handleSubmit = async (form: TeamFormData) => {
    try {
      await updateTeam({
        teamId,
        body: {
          name: form.name,
          category: form.category,
          description: form.description,
          link: form.link || undefined,
          sns: form.sns || undefined,
          imageKey: form.imageUrl || undefined,
        },
      });
      router.push(`/team/${teamId}`);
    } catch (err) {
      console.error("팀 수정 실패", err);
    }
  };

  return (
    <View className="flex-1">
      <TeamForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

      <Modal
        transparent
        visible={isDeleteConfirmOpen}
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
      >
        <Pressable
          onPress={() => setIsDeleteConfirmOpen(false)}
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
                className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3"
              >
                <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setIsDeleteConfirmOpen(false);
                  await handleDelete();
                }}
                className="flex-1 items-center rounded-xl bg-[#E22222] py-3"
              >
                <Text className="text-[14px] font-semibold text-white">
                  삭제
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
