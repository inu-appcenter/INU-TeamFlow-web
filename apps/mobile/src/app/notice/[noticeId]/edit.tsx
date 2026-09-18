import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import {
  useTeamNoticeDetail,
  useUpdateTeamNotice,
  useGetPresignedUrls,
} from "@moimi/core/hooks/useNoticeQuery";
import { uploadImageToS3 } from "@/utils/image/uploadImageToS3";
import { getImageKeyFromUrl } from "@/utils/image/getImageKey";

const categoryColorMap: Record<string, string> = {
  CONTEST: "#FBE4F8",
  STUDY: "#D8FAD8",
  PROJECT: "#DCEBFF",
  CLUB: "#FFF1CC",
  ETC: "#E9E9E9",
};

const categoryMap: Record<string, string> = {
  CONTEST: "공모전",
  STUDY: "스터디",
  PROJECT: "프로젝트",
  CLUB: "동아리",
  ETC: "기타",
};

type ExistingImage = { id: string; imageKey: string; imageUrl: string };
type LocalImage = {
  id: string;
  uri: string;
  fileName: string;
  mimeType: string;
};

function InputField({
  label,
  value,
  onChangeText,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  required?: boolean;
}) {
  return (
    <View className="mb-3">
      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-[13px] font-bold text-[#B0B0B0]">{label}</Text>
        {required && (
          <Text className="text-[14px] font-semibold text-[#FF6B6B]">*</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] p-4 text-[#2C2C2C]"
      />
    </View>
  );
}

function TextAreaField({
  label,
  value,
  onChangeText,
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <View>
      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-[13px] font-bold text-[#B0B0B0]">{label}</Text>
        {required && (
          <Text className="text-[14px] font-semibold text-[#FF6B6B]">*</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        style={{ minHeight: 170 }}
        className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3.5 text-[#2C2C2C]"
      />
      {maxLength && (
        <Text className="mt-1 text-right text-[11px] text-[#B0B0B0]">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

function PinToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24],
  });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? "#5E92F0" : "#D6DDE5",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#fff",
            transform: [{ translateX }],
          }}
        />
      </View>
    </Pressable>
  );
}

export default function NoticeEditScreen() {
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
  const { mutateAsync: getPresignedUrls } = useGetPresignedUrls();
  const { mutateAsync: updateNotice } = useUpdateTeamNotice(teamIdNum);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!notice || initialized) return;
    setTitle(notice.title);
    setContent(notice.content);
    setIsPinned(notice.isPinned);
    setExistingImages(
      [...notice.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({
          id: `existing-${img.sortOrder}`,
          imageKey: getImageKeyFromUrl(img.imageUrl),
          imageUrl: img.imageUrl,
        }))
    );
    setInitialized(true);
  }, [notice, initialized]);

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handleSelectImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showErrorMessage("사진 접근 권한이 필요해요");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const picked: LocalImage[] = result.assets.map((asset) => ({
      id: `${asset.uri}-${Date.now()}-${Math.random()}`,
      uri: asset.uri,
      fileName: asset.fileName ?? "image.jpg",
      mimeType: asset.mimeType ?? "image/jpeg",
    }));

    setNewImages((prev) => [...prev, ...picked]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let uploadedImageKeys: string[] = [];

      if (newImages.length > 0) {
        const presignedList = await getPresignedUrls(
          newImages.map((img) => ({
            fileName: img.fileName,
            contentType: img.mimeType,
          }))
        );

        await Promise.all(
          presignedList.map((presigned, i) =>
            uploadImageToS3(
              presigned.uploadUrl,
              newImages[i].uri,
              newImages[i].mimeType
            )
          )
        );

        uploadedImageKeys = presignedList.map((p) => p.imageKey);
      }

      const imageKeys = [
        ...existingImages.map((img) => img.imageKey),
        ...uploadedImageKeys,
      ];

      await updateNotice({
        noticeId: noticeIdNum,
        body: {
          title: title.trim(),
          content: content.trim(),
          isPinned,
          imageKeys,
        },
      });

      router.replace({
        pathname: "/notice/[noticeId]",
        params: { noticeId: String(noticeIdNum), teamId: String(teamIdNum) },
      });
    } catch (err) {
      console.log("공지 수정 실패", err);
      showErrorMessage("공지 수정에 실패했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !notice) {
    return (
      <View className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text className="text-[14px] text-[#989898]">불러오는 중...</Text>
      </View>
    );
  }

  const headerColor = team
    ? categoryColorMap[team.category] ?? "#E9E9E9"
    : "#E9E9E9";

  return (
    <View className="flex-1 bg-[#ffffff]">
      {errorMessage && (
        <View
          style={{
            position: "absolute",
            top: 160,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      )}

      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:scale-90">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="rounded-full bg-white px-4 py-2 -mt-1">
          <Text className="text-[13px] font-semibold text-[#2C2C2C]">
            {team ? categoryMap[team.category] : "공지 수정"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 60,
        }}
      >
        {/* 이미지 */}
        <View className="mb-5">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            이미지
          </Text>

          <View className="flex-row flex-wrap gap-2.5">
            {existingImages.map((img) => (
              <View
                key={img.id}
                className="relative h-[170px] w-[170px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
              >
                <Image
                  source={{ uri: img.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() =>
                    setExistingImages((prev) =>
                      prev.filter((i) => i.id !== img.id)
                    )
                  }
                  className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-[#989898]/60"
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ))}

            {newImages.map((img) => (
              <View
                key={img.id}
                className="relative h-[170px] w-[170px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
              >
                <Image
                  source={{ uri: img.uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() =>
                    setNewImages((prev) => prev.filter((i) => i.id !== img.id))
                  }
                  className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-[#989898]/60"
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={handleSelectImages}
              className="h-[170px] w-[170px] items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#D6DDE5]/60 bg-[#F6F8FA] active:bg-[#EEF1F5]"
            >
              <Plus size={20} strokeWidth={2.5} color="#989898" />
              <Text className="text-[12px] font-semibold text-[#989898]">
                추가
              </Text>
            </Pressable>
          </View>

          <Text className="mt-2 text-[11px] text-[#B0B0B0]">
            이미지는 선택 사항이며 여러 장 첨부할 수 있어요
          </Text>
        </View>

        {/* 고정 여부 */}
        <View className="mb-5 flex-row items-center gap-3">
          <Text className="text-[13px] font-bold text-[#B0B0B0]">
            고정 여부
          </Text>
          <PinToggle value={isPinned} onChange={setIsPinned} />
        </View>

        <InputField
          label="제목"
          required
          value={title}
          onChangeText={setTitle}
        />
        <TextAreaField
          label="내용"
          required
          value={content}
          onChangeText={setContent}
        />

        <View className="mt-8 items-center">
          <Pressable
            disabled={isSubmitting}
            onPress={() => {
              if (!title.trim()) {
                showErrorMessage("제목을 입력해주세요");
                return;
              }
              if (!content.trim()) {
                showErrorMessage("내용을 입력해주세요");
                return;
              }
              setIsConfirmOpen(true);
            }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-10 py-3.5 transition-transform duration-150 ease-out active:scale-95 disabled:opacity-60"
          >
            <Text className="text-[15px] font-semibold text-white">수정</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={isConfirmOpen}
        animationType="fade"
        onRequestClose={() => setIsConfirmOpen(false)}
      >
        <Pressable
          onPress={() => setIsConfirmOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white p-6"
          >
            <Text className="text-center text-[19px] font-bold text-[#2C2C2C]">
              공지를 수정할까요?
            </Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setIsConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setIsConfirmOpen(false);
                  await handleSubmit();
                }}
                className="flex-1 rounded-xl bg-[#5E92F0] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-white">
                  수정
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
