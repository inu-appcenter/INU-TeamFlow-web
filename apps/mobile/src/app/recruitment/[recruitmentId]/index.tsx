// apps/mobile/src/app/recruitment/[recruitmentId]/index.tsx
import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react-native";
import {
  useRecruitmentDetail,
  useDeleteRecruitment,
} from "@moimi/core/hooks/useRecruitmentQuery";
import { useCreateDirectChatRoom } from "@moimi/core/hooks/chat/useCreateDirectChatRoom";
import { categoryMap, categoryColorMap } from "@moimi/core/constants/category";
import { formatDate } from "@/utils/date/formatDate";
import { getDday } from "@/utils/date/getDday";
import ScrapButton from "@/components/ScrapButton";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center py-3">
      <Text
        style={{ width: 80 }}
        className="text-[13px] font-medium text-[#989898]"
      >
        {label}
      </Text>
      <View className="flex-1 font-semibold">{children}</View>
    </View>
  );
}

export default function RecruitmentDetailScreen() {
  const { recruitmentId } = useLocalSearchParams<{ recruitmentId: string }>();
  const recruitmentIdNum = Number(recruitmentId);

  const { data: recruitment, isLoading } =
    useRecruitmentDetail(recruitmentIdNum);
  const { mutate: deleteRecruitmentMutate, isPending: isDeleting } =
    useDeleteRecruitment();
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (isLoading || !recruitment) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[14px] text-[#989898]">불러오는 중...</Text>
      </View>
    );
  }

  const hasAnnouncement =
    recruitment.infoPostId !== null &&
    recruitment.infoPostId !== undefined &&
    !!recruitment.infoPostTitle;

  const isClosed =
    new Date(recruitment.endAt) < new Date() || !recruitment.isOpened;
  const isRecruiter = recruitment.isRecruiter;
  const isDisabled = recruitment.hasApplied || isClosed;
  const headerColor = categoryColorMap[recruitment.category] ?? "#E9E9E9";

  const handleDelete = () => {
    if (isDeleting) return;
    deleteRecruitmentMutate(recruitmentIdNum, {
      onSuccess: () => router.replace("/recruitment"),
    });
  };

  const handleStartDirectChat = async () => {
    const room = await createDirectRoom(recruitment.recruiterId);
    // router.push(`/chat/${room.chatRoomId}`);
  };

  return (
    <View className="flex-1 bg-[#ffffff]">
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={() => router.push(`/recruitment`)}
          className="active:scale-90 transition-transform duration-150 ease-out"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="flex-row items-center gap-4">
          {!isRecruiter && (
            <ScrapButton
              type="recruitment"
              id={recruitmentIdNum}
              initialScrapped={recruitment.isScrap}
            />
          )}

          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="active:scale-90 transition-transform duration-150 ease-out"
          >
            <EllipsisVertical size={20} color="#2C2C2C" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 80,
        }}
      >
        <Text className="text-[22px] font-bold text-[#2C2C2C]">
          {recruitment.title}
        </Text>

        {hasAnnouncement ? (
          <Pressable
            onPress={() => router.push(`/infoPost/${recruitment.infoPostId}`)}
            className="mt-4 self-start rounded-xl bg-[#EEF1F5] px-3 py-2 transition-transform duration-150 ease-out cale-95"
          >
            <Text className="text-[13px] text-[#2C2C2C]">
              &lt; {recruitment.infoPostTitle} &gt; 바로가기
            </Text>
          </Pressable>
        ) : (
          <View className="mt-4 self-start rounded-xl bg-[#EEF1F5] px-3 py-2">
            <Text className="text-[13px] text-[#989898]">
              연결된 정보글이 없습니다
            </Text>
          </View>
        )}

        <View className="mt-6">
          <InfoRow label="종류">
            <Text className="text-[14px] text-[#2C2C2C]">
              {categoryMap[recruitment.category]}
            </Text>
          </InfoRow>

          <InfoRow label="모집현황">
            <View
              style={{ backgroundColor: isClosed ? "#EEF1F5" : "#DDF7E5" }}
              className="self-start rounded-full px-3 py-1.5"
            >
              <Text
                style={{ color: isClosed ? "#989898" : "#2E7845" }}
                className="text-[13px] font-medium"
              >
                {isClosed ? "모집마감" : "모집중"}
              </Text>
            </View>
          </InfoRow>

          <InfoRow label="모집마감">
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] text-[#2C2C2C]">
                {formatDate(recruitment.endAt)}
              </Text>
              <Text className="text-[13px] font-medium text-[#5E92F0]">
                {getDday(recruitment.endAt)}
              </Text>
            </View>
          </InfoRow>

          <InfoRow label="모집인원">
            <Text className="text-[14px] text-[#2C2C2C]">
              {recruitment.targetMemberCount}명
            </Text>
          </InfoRow>

          <InfoRow label="작성자">
            <View className="flex-row items-center gap-3">
              <Text className="text-[14px] text-[#2C2C2C]">
                {recruitment.recruiterName}
              </Text>
              {!isRecruiter && (
                <Pressable
                  onPress={handleStartDirectChat}
                  disabled={isCreatingRoom}
                  className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-3 py-1.5 transition-transform duration-150 ease-out active:scale-95 disabled:opacity-50"
                >
                  <Text className="text-[12px] text-[#2c2c2c]">1:1 채팅</Text>
                </Pressable>
              )}
            </View>
          </InfoRow>
        </View>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <View className="mt-5">
          <Text className="text-[13px] text-[#989898]">상세요강</Text>
          <Text className="mt-3 text-[15px] leading-7 text-[#2C2C2C]">
            {recruitment.description}
          </Text>
        </View>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <View className="mt-8 items-center">
          <Pressable
            disabled={!isRecruiter && isDisabled}
            onPress={() => {
              if (isRecruiter) {
                router.push(
                  `/recruitment/${recruitmentIdNum}/apply/applications`
                );
                return;
              }
              router.push(`/recruitment/${recruitmentIdNum}/apply`);
            }}
            className={`rounded-xl px-10 py-3.5 active:scale-95 transition-transform duration-150 ease-out ${
              !isRecruiter && isDisabled ? "bg-[#EEF1F5]" : "bg-[#5E92F0]"
            }`}
          >
            <Text
              className={`text-[15px] font-semibold ${
                !isRecruiter && isDisabled ? "text-[#989898]" : "text-white"
              }`}
            >
              {isRecruiter
                ? "지원자 보기"
                : recruitment.hasApplied
                ? "지원 완료"
                : isClosed
                ? "모집 마감"
                : "지원하기"}
            </Text>
          </Pressable>
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
            {isRecruiter ? (
              <>
                {!isClosed && (
                  <Pressable
                    onPress={() => {
                      setIsMenuOpen(false);
                      router.push({
                        pathname: "/recruitment/[recruitmentId]/edit",
                        params: { recruitmentId: String(recruitmentIdNum) },
                      });
                    }}
                    className="px-4 py-2.5 active:bg-[#F6F8FA]"
                  >
                    <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                      수정하기
                    </Text>
                  </Pressable>
                )}
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
              </>
            ) : (
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  console.log("TODO: 신고 모달 열기");
                }}
                className="px-4 py-2.5 active:bg-[#F6F8FA]"
              >
                <Text className="text-[14px] font-semibold text-[#E22222]">
                  신고하기
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      )}

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
              모집글을 삭제할까요?
            </Text>
            <Text className="mt-2 text-center text-[14px] text-[#989898]">
              삭제한 모집글은 복구할 수 없어요
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
                onPress={() => {
                  setIsDeleteConfirmOpen(false);
                  handleDelete();
                }}
                disabled={isDeleting}
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
