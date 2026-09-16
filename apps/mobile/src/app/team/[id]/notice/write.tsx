import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import {
  useCreateTeamNotice,
  useGetPresignedUrls,
} from "@moimi/core/hooks/useNoticeQuery";

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
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
}) {
  return (
    <View className="mb-3">
      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-[13px] font-bold text-[#B0B0B0]">{label}</Text>
        {required && (
          <Text className="text-[13px] font-semibold text-[#FF6B6B]">*</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[14px] text-[#2C2C2C]"
      />
    </View>
  );
}

function TextAreaField({
  label,
  value,
  onChangeText,
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
}) {
  return (
    <View className="mb-3">
      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-[13px] font-bold text-[#B0B0B0]">{label}</Text>
        {required && (
          <Text className="text-[13px] font-semibold text-[#FF6B6B]">*</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        style={{ minHeight: 160 }}
        className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 text-[14px] text-[#2C2C2C]"
      />
    </View>
  );
}

export default function TeamNoticeWriteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team } = useTeamDetail(teamId);
  const { mutateAsync: getPresignedUrls } = useGetPresignedUrls();
  const { mutateAsync: createNotice } = useCreateTeamNotice(teamId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const pinnedTranslateX = useRef(
    new Animated.Value(isPinned ? 24 : 4)
  ).current;

  useEffect(() => {
    Animated.timing(pinnedTranslateX, {
      toValue: isPinned ? 24 : 4,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isPinned]);

  const [images, setImages] = useState<LocalImage[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentColor = team
    ? categoryColorMap[team.category] ?? "#E9E9E9"
    : "#E9E9E9";

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handlePickImages = async () => {
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

    const newImages: LocalImage[] = result.assets.map((asset) => ({
      id: `${asset.fileName ?? "image"}-${Date.now()}-${Math.random()}`,
      uri: asset.uri,
      fileName: asset.fileName ?? `image-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let imageKeys: string[] = [];

      if (images.length > 0) {
        const presignedList = await getPresignedUrls(
          images.map((img) => ({
            fileName: img.fileName,
            contentType: img.mimeType,
          }))
        );

        await Promise.all(
          presignedList.map(async (presigned, i) => {
            const blob = await (await fetch(images[i].uri)).blob();
            await fetch(presigned.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": images[i].mimeType },
              body: blob,
            });
          })
        );

        imageKeys = presignedList.map((p) => p.imageKey);
      }

      await createNotice({
        title: title.trim(),
        content: content.trim(),
        isPinned,
        imageKeys,
      });

      router.push(`/team/${teamId}/notice`);
    } catch (err) {
      console.error("공지 작성 실패", err);
      showErrorMessage("공지 작성에 실패했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {errorMessage && (
        <View
          style={{
            position: "absolute",
            top: 130,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-[13px] font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      )}

      <View
        style={{ backgroundColor: currentColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <Pressable onPress={() => router.push(`/team/${teamId}/notice`)}>
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <View className="rounded-full bg-white/80 px-5 py-2">
          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
            {team ? categoryMap[team.category] : "공지 작성"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
          이미지
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          {images.map((img) => (
            <View
              key={img.id}
              style={{ width: 150, height: 150 }}
              className="overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
            >
              <Image
                source={{ uri: img.uri }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => handleRemoveImage(img.id)}
                style={{ position: "absolute", top: 8, right: 8 }}
                className="h-6 w-6 items-center justify-center rounded-full bg-[#989898]/50"
              >
                <X size={14} color="#fff" />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={handlePickImages}
            style={{ width: 150, height: 150 }}
            className="items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#D6DDE5]/60 bg-[#F6F8FA]"
          >
            <Plus size={20} strokeWidth={2.5} color="#9C9C9C" />
            <Text className="text-[12px] font-semibold text-[#9C9C9C]">
              추가
            </Text>
          </Pressable>
        </View>
        <Text className="mt-2 text-[11px] text-[#B0B0B0]">
          이미지는 선택 사항이며 여러 장 첨부할 수 있어요
        </Text>

        <View className="mt-4 mb-4 flex-row items-center gap-3">
          <Text className="text-[13px] font-bold text-[#B0B0B0]">
            고정 여부
          </Text>
          <Pressable
            onPress={() => setIsPinned((prev) => !prev)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              backgroundColor: isPinned ? "#5E92F0" : "#D6DDE5",
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#fff",
                transform: [{ translateX: pinnedTranslateX }],
              }}
            />
          </Pressable>
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

        <View className="mt-6 items-center">
          <Pressable
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
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.6 : 1 }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-10 py-3.5"
          >
            <Text className="text-[15px] font-semibold text-white">작성</Text>
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
            <Text className="text-center text-[18px] font-bold text-[#2C2C2C]">
              공지를 작성할까요?
            </Text>
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setIsConfirmOpen(false)}
                className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3"
              >
                <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setIsConfirmOpen(false);
                  await handleSubmit();
                }}
                className="flex-1 items-center rounded-xl bg-[#5E92F0] py-3"
              >
                <Text className="text-[14px] font-semibold text-white">
                  작성
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
