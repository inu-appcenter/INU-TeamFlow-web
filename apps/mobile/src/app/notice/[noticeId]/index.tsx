// app/notice/[noticeId]/index.tsx
import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, EllipsisVertical, Pin } from "lucide-react-native";
import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import {
  useTeamNoticeDetail,
  useDeleteTeamNotice,
} from "@moimi/core/hooks/useNoticeQuery";
import { categoryColorMap } from "@moimi/core/constants/category";
import { formatDate } from "@/utils/date/formatDate";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import ImagePreviewModal from "@/components/ImagePreviewModal";

export default function NoticeDetailScreen() {
  const { noticeId, teamId } = useLocalSearchParams<{
    noticeId: string;
    teamId: string;
  }>();
  const teamIdNum = Number(teamId);
  const noticeIdNum = Number(noticeId);

  const { data: team } = useTeamDetail(teamIdNum);
  const { data: notice, isLoading } = useTeamNoticeDetail(
    teamIdNum,
    noticeIdNum
  );
  const { mutateAsync: deleteNotice, isPending: isDeletePending } =
    useDeleteTeamNotice(teamIdNum);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const headerColor = team
    ? categoryColorMap[team.category] ?? "#E9E9E9"
    : "#E9E9E9";

  // 들어온 화면(팀 상세 / 공지 목록 / 마이페이지 등)으로 pop
  // 푸시 알림·딥링크로 바로 열려 이전 화면이 없으면 해당 팀 공지 목록으로 교체
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/team/${teamIdNum}/notice`);
    }
  };

  const handleDelete = async () => {
    if (isDeletePending) return;
    try {
      await deleteNotice(noticeIdNum);
      goBack();
    } catch (err) {
      console.log("공지 삭제 실패", err);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[14px] text-[#989898]">불러오는 중...</Text>
      </View>
    );
  }

  if (!notice) {
    return (
      <View className="flex-1 bg-[#F0F2F5]">
        <View style={{ paddingTop: 60 }} className="px-5 pb-4">
          <Pressable
            onPress={goBack}
            className="self-start transition-transform duration-150 ease-out active:scale-90"
          >
            <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-[15px] font-semibold text-[#2C2C2C]">
            존재하지 않는 공지입니다.
          </Text>
        </View>
      </View>
    );
  }

  const sortedImages = [...notice.images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <View className="flex-1 bg-[#ffffff]">
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={goBack}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        {notice.isEditable && (
          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="transition-transform duration-150 ease-out active:scale-90"
          >
            <EllipsisVertical size={20} color="#2C2C2C" />
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 60,
        }}
      >
        <View className="flex-row flex-wrap items-center gap-2">
          {notice.isPinned && <Pin size={22} strokeWidth={3} color="#5E92F0" />}
          <Text className="flex-1 text-[22px] font-bold text-[#2C2C2C]">
            {notice.title}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 overflow-hidden rounded-full border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5]">
              {notice.author.profileUrl && (
                <Image
                  source={{ uri: notice.author.profileUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              )}
            </View>
            <Text className="text-[14px] text-[#989898]">
              {notice.author.name} · {getTeamRoleLabel(notice.author.teamRole)}
            </Text>
          </View>
          <Text className="text-[14px] text-[#989898]">
            {formatDate(notice.createdAt)}
          </Text>
        </View>

        <View className="mt-2 border-b-[0.5px] border-[#D6DDE5]" />

        <View className="mt-4 gap-4">
          {sortedImages.map((image) => (
            <Pressable
              key={image.sortOrder}
              onPress={() => setPreviewImageUrl(image.imageUrl)}
            >
              <Image
                source={{ uri: image.imageUrl }}
                style={{ width: "100%", height: 220, borderRadius: 12 }}
                resizeMode="cover"
              />
            </Pressable>
          ))}

          <Text className="text-[16px] leading-7 text-[#2C2C2C]">
            {notice.content}
          </Text>
        </View>
      </ScrollView>

      {isMenuOpen && (
        <Pressable
          onPress={() => setIsMenuOpen(false)}
          style={{ position: "absolute", inset: 0 }}
          className="bg-black/10"
        >
          <View
            style={{ position: "absolute", top: 90, right: 20 }}
            className="w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-2"
          >
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                router.push({
                  pathname: "/notice/[noticeId]/edit",
                  params: {
                    noticeId: String(noticeIdNum),
                    teamId: String(teamIdNum),
                  },
                });
              }}
              className="px-4 py-2.5 active:bg-[#F6F8FA]"
            >
              <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                수정하기
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                setIsDeleteConfirmOpen(true);
              }}
              className="px-4 py-2.5 active:bg-[#F6F8FA]"
            >
              <Text className="text-[14px] font-semibold text-[#E22222]">
                삭제하기
              </Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
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
            <Text className="text-center text-[19px] font-bold text-[#2C2C2C]">
              공지를 삭제할까요?
            </Text>
            <Text className="mt-2 text-center text-[14px] text-[#989898]">
              삭제한 공지는 복구할 수 없어요
            </Text>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setIsDeleteConfirmOpen(false);
                  await handleDelete();
                }}
                disabled={isDeletePending}
                className="flex-1 rounded-xl bg-[#E22222] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-white">
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
