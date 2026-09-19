import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Image,
  Alert,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react-native";
import {
  useInfoPostDetail,
  useDeleteInfoPost,
} from "@moimi/core/hooks/useInfoPostQuery";
import {
  infoPostCategoryColorMap,
  infoPostCategoryMap,
} from "@moimi/core/constants/infoPost";
import { formatDate } from "@/utils/date/formatDate";
import ScrapButton from "@/components/ScrapButton";

const getSafeUrl = (url?: string | null) => {
  if (!url) return null;
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const { protocol } = new URL(withProtocol);
    return protocol === "http:" || protocol === "https:" ? withProtocol : null;
  } catch {
    return null;
  }
};

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
      <View className="flex-1">{children}</View>
    </View>
  );
}

export default function InfoPostDetailScreen() {
  const { infoPostId } = useLocalSearchParams<{ infoPostId: string }>();
  const infoPostIdNum = Number(infoPostId);

  const { data: infoPost, isLoading } = useInfoPostDetail(infoPostIdNum);
  const { mutate: deleteInfoPostMutate, isPending: isDeleting } =
    useDeleteInfoPost();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (isLoading || !infoPost) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[14px] text-[#989898]">
          {isLoading ? "불러오는 중..." : "존재하지 않는 정보글입니다"}
        </Text>
      </View>
    );
  }

  const headerColor = infoPostCategoryColorMap[infoPost.category] ?? "#E9E9E9";

  const handleDelete = () => {
    if (isDeleting) return;
    deleteInfoPostMutate(infoPostIdNum, {
      onSuccess: () => router.replace("/infoPost"),
      onError: () => Alert.alert("오류", "정보글 삭제에 실패했습니다"),
    });
  };

  const sortedImages = [...(infoPost.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const safeUrl = getSafeUrl(infoPost.sourceUrl);
  return (
    <View className="flex-1 bg-white">
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="flex-row items-center gap-4">
          {!infoPost.isAuthor && (
            <ScrapButton
              type="infoPost"
              id={infoPostIdNum}
              initialScrapped={infoPost.isScrap}
            />
          )}

          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="transition-transform duration-150 ease-out active:scale-90"
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
          {infoPost.title}
        </Text>

        <View className="mt-6">
          <InfoRow label="종류">
            <Text className="text-[14px] text-[#2C2C2C]">
              {infoPostCategoryMap[infoPost.category]}
            </Text>
          </InfoRow>
          <InfoRow label="작성자">
            <Text className="text-[14px] text-[#2C2C2C]">
              {infoPost.author.name}
            </Text>
          </InfoRow>
          <InfoRow label="작성일">
            <Text className="text-[14px] text-[#2C2C2C]">
              {formatDate(infoPost.createdAt)}
            </Text>
          </InfoRow>
          <InfoRow label="모집글">
            <Text className="text-[14px] text-[#2C2C2C]">
              연결된 모집글 {infoPost.recruitmentCount}개
            </Text>
          </InfoRow>

          {safeUrl && (
            <InfoRow label="원문 링크">
              <Pressable
                onPress={() => Linking.openURL(safeUrl).catch(() => {})}
                hitSlop={8}
                className="active:opacity-60 "
              >
                <Text className="text-[14px]  text-[#5E92F0] underline">
                  {infoPost.sourceUrl}
                </Text>
              </Pressable>
            </InfoRow>
          )}
        </View>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <Text className="mt-6 text-[15px] leading-7 text-[#2C2C2C]">
          {infoPost.content}
        </Text>

        {sortedImages.length > 0 && (
          <View className="mt-4 gap-4">
            {sortedImages.map((image) => (
              <Image
                key={`${image.imageUrl}-${image.sortOrder}`}
                source={{ uri: image.imageUrl }}
                style={{ width: "100%", height: 320, borderRadius: 12 }}
                resizeMode="contain"
              />
            ))}
          </View>
        )}
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
            {infoPost.isAuthor ? (
              <>
                <Pressable
                  onPress={() => {
                    setIsMenuOpen(false);
                    router.push({
                      pathname: "/infoPost/[infoPostId]/edit",
                      params: { infoPostId: String(infoPostIdNum) },
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
              정보글을 삭제할까요?
            </Text>
            <Text className="mt-2 text-center text-[14px] text-[#989898]">
              삭제한 정보글은 복구할 수 없어요
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
