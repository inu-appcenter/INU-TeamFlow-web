import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, ImagePlus, X } from "lucide-react-native";
import { getPresignedUrl } from "@moimi/core/api/team";
import {
  categoryMap,
  categoryColorMap,
  DEFAULT_CATEGORY_COLOR,
} from "@moimi/core/constants/category";
import { darkenColor } from "@/utils/color/darkenColor";

export type TeamCategory = "CONTEST" | "STUDY" | "CLUB" | "PROJECT" | "ETC";

export type TeamFormData = {
  name: string;
  category: TeamCategory;
  description: string;
  link: string;
  sns: string;
  imageUrl: string;
};

type TeamFormProps = {
  mode: "create" | "edit";
  initialData?: TeamFormData;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onDelete?: () => void;
};

const defaultForm: TeamFormData = {
  name: "",
  category: "ETC",
  description: "",
  link: "",
  sns: "",
  imageUrl: "",
};

export default function TeamForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
}: TeamFormProps) {
  const [form, setForm] = useState<TeamFormData>(initialData ?? defaultForm);
  const [previewUri, setPreviewUri] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const isBusy = isSubmitting || isUploadingImage;
  const currentColor =
    categoryColorMap[form.category] ?? DEFAULT_CATEGORY_COLOR;

  const onChange = (key: keyof TeamFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showErrorMessage("사진 접근 권한이 필요해요");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setPreviewUri(asset.uri);
    setIsUploadingImage(true);

    try {
      const fileName = asset.fileName ?? `team-${Date.now()}.jpg`;
      const contentType = asset.mimeType ?? "image/jpeg";

      const { uploadUrl, imageKey } = await getPresignedUrl({
        fileName,
        contentType,
      });

      const blob = await (await fetch(asset.uri)).blob();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      setForm((prev) => ({ ...prev, imageUrl: imageKey }));
    } catch (err) {
      console.error("이미지 업로드 실패", err);
      showErrorMessage("이미지 업로드에 실패했어요");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUri(null);
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      showErrorMessage("팀 이름을 입력해주세요");
      return false;
    }
    if (!form.description.trim()) {
      showErrorMessage("팀 소개를 입력해주세요");
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(form);
    } catch (error) {
      console.error(mode === "create" ? "팀 생성 실패" : "팀 수정 실패", error);
      showErrorMessage(
        mode === "create" ? "팀 생성에 실패했습니다" : "팀 수정에 실패했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        style={{ backgroundColor: currentColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          disabled={isBusy}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="rounded-full bg-white/80 px-5 py-2">
          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
            {categoryMap[form.category]}
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
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            팀 이미지
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {previewUri ? (
              <View
                style={{ width: 150, height: 150 }}
                className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]"
              >
                <Image
                  source={{ uri: previewUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={handleRemoveImage}
                  disabled={isBusy}
                  style={{ position: "absolute", top: 6, right: 6 }}
                  className="h-6 w-6 items-center justify-center rounded-full bg-black/60"
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                disabled={isBusy}
                style={{ width: 150, height: 150 }}
                className="items-center justify-center rounded-xl border-2 border-dashed border-[#D6DDE5] bg-[#F6F8FA]"
              >
                <ImagePlus size={24} color="#9C9C9C" />
              </Pressable>
            )}
          </View>
          <Text className="mt-2 text-[11px] text-[#B0B0B0]">
            이미지를 선택하지 않으면 기본 이미지가 적용됩니다
          </Text>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            팀 이름<Text className="text-[#FF6B6B]"> *</Text>
          </Text>
          <TextInput
            value={form.name}
            editable={!isBusy}
            onChangeText={(v) => onChange("name", v)}
            placeholder="팀 이름을 입력해주세요"
            placeholderTextColor="#989898"
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            카테고리<Text className="text-[#FF6B6B]"> *</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(categoryMap) as TeamCategory[]).map((key) => {
              const isSelected = form.category === key;
              const color = categoryColorMap[key];
              return (
                <Pressable
                  key={key}
                  disabled={isBusy}
                  onPress={() => onChange("category", key)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: color,
                          borderColor: darkenColor(color, 30),
                          borderWidth: 0.5,
                        }
                      : {
                          backgroundColor: "#EEF1F5",
                          borderColor: "#D6DDE5",
                          borderWidth: 0.5,
                        }
                  }
                  className="rounded-3xl px-4 py-3 disabled:opacity-50"
                >
                  <Text
                    style={
                      isSelected
                        ? { color: darkenColor(color, 140) }
                        : { color: "#2C2C2C" }
                    }
                    className="text-[13px] font-medium"
                  >
                    {categoryMap[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            팀 소개<Text className="text-[#FF6B6B]"> *</Text>
          </Text>
          <TextInput
            value={form.description}
            editable={!isBusy}
            onChangeText={(v) => onChange("description", v)}
            multiline
            maxLength={50}
            textAlignVertical="top"
            placeholder="팀을 소개해주세요"
            placeholderTextColor="#B0B0B0"
            style={{ minHeight: 90 }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] p-4 text-[#2C2C2C]"
          />
          <Text className="mt-1 text-right text-[11px] text-[#B0B0B0]">
            {form.description.length}/50
          </Text>
        </View>

        {/* <View className="">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            팀 링크
          </Text>
          <TextInput
            value={form.link}
            editable={!isBusy}
            onChangeText={(v) => onChange("link", v)}
            placeholder="팀 링크를 입력해주세요"
            placeholderTextColor="#989898"
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View>

        <View className="mt-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            팀 SNS
          </Text>
          <TextInput
            value={form.sns}
            editable={!isBusy}
            onChangeText={(v) => onChange("sns", v)}
            placeholder="팀 SNS를 입력해주세요"
            placeholderTextColor="#989898"
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View> */}

        <View className="mt-8 flex-row justify-center gap-4">
          {mode === "edit" && onDelete && (
            <Pressable
              onPress={onDelete}
              disabled={isBusy}
              className="rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-10 py-3.5 transition-transform duration-150 ease-out active:scale-95"
            >
              <Text className="text-[15px] font-semibold text-[#E22222]">
                삭제
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={async () => {
              if (!validate()) return;
              if (mode === "create") {
                setIsConfirmOpen(true);
              } else {
                await submitForm();
              }
            }}
            disabled={isBusy}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0] px-10 py-3.5 transition-transform duration-150 ease-out active:scale-95"
          >
            {isBusy ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-[15px] font-semibold text-white">
                  {isUploadingImage ? "이미지 업로드 중" : "처리 중"}
                </Text>
              </View>
            ) : (
              <Text className="text-[15px] font-semibold text-white">
                {mode === "create" ? "생성" : "수정"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {mode === "create" && (
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
                새 팀을 생성할까요?
              </Text>
              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={() => setIsConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[14px] font-semibold text-[#2C2C2C]">
                    취소
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    setIsConfirmOpen(false);
                    await submitForm();
                  }}
                  className="flex-1 rounded-xl bg-[#5E92F0] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[14px] font-semibold text-white">
                    생성
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
