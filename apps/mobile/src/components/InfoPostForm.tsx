import { useState, useEffect, useRef } from "react";
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
import { categoryColorMap } from "@moimi/core/constants/contentCard";
import { infoPostCategoryFilterOptions } from "@moimi/core/constants/infoPost";
import { useUploadInfoPostImages } from "@moimi/core/hooks/useInfoPostQuery";
import type { InfoPostCategory } from "@moimi/core/types/infoPost";
import { darkenColor } from "@/utils/color/darkenColor";

export interface InfoPostFormData {
  category: InfoPostCategory;
  title: string;
  content: string;
  imageKeys: string[];
}

interface InitialImage {
  imageUrl: string;
  imageKey: string;
}

interface SelectedImage {
  uri: string;
  fileName?: string;
  mimeType?: string;
  imageKey?: string;
}

interface InfoPostFormProps {
  mode: "create" | "edit";
  initialData?: InfoPostFormData;
  initialImages?: InitialImage[];
  onSubmit: (form: InfoPostFormData) => Promise<void>;
  onDelete?: () => void;
}

const defaultForm: InfoPostFormData = {
  category: "CONTEST",
  title: "",
  content: "",
  imageKeys: [],
};

const infoPostCategoryOptions = infoPostCategoryFilterOptions.filter(
  (c) => c.value !== "ALL"
);
const MAX_IMAGE_COUNT = 3;

export default function InfoPostForm({
  mode,
  initialData,
  initialImages = [],
  onSubmit,
  onDelete,
}: InfoPostFormProps) {
  const [form, setForm] = useState<InfoPostFormData>(
    initialData ?? defaultForm
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] =
    useState<InitialImage[]>(initialImages);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadImages = useUploadInfoPostImages();

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const prevInitialData = useRef(initialData);
  useEffect(() => {
    if (initialData && initialData !== prevInitialData.current) {
      prevInitialData.current = initialData;
      setForm(initialData);
    }
  }, [initialData]);

  const prevInitialImages = useRef(initialImages);
  useEffect(() => {
    if (mode === "edit" && initialImages !== prevInitialImages.current) {
      prevInitialImages.current = initialImages;
      setExistingImages(initialImages);
    }
  }, [mode, initialImages]);

  const isBusy = isSubmitting || uploadImages.isPending;
  const totalImageCount = existingImages.length + selectedImages.length;
  const currentColor = categoryColorMap[form.category] ?? "#E9E9E9";

  const handlePickImages = async () => {
    const availableCount = MAX_IMAGE_COUNT - totalImageCount;
    if (availableCount <= 0) {
      showErrorMessage("이미지는 최대 3장까지 등록할 수 있습니다");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showErrorMessage("사진 접근 권한이 필요해요");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: availableCount,
      quality: 0.8,
    });

    if (result.canceled) return;

    const newImages: SelectedImage[] = result.assets
      .slice(0, availableCount)
      .map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName ?? `image-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      }));

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveExistingImage = (imageKey: string) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.imageKey !== imageKey)
    );
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.title.trim()) {
      showErrorMessage("정보글 제목을 입력해주세요");
      return false;
    }
    if (!form.content.trim()) {
      showErrorMessage("정보글 내용을 입력해주세요");
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      const existingImageKeys = existingImages.map((img) => img.imageKey);
      const imagesToUpload = selectedImages.filter((img) => !img.imageKey);

      let uploadedKeys: string[] = [];
      if (imagesToUpload.length > 0) {
        // TODO: useUploadInfoPostImages가 RN {uri,name,type} 형식을 받는지 확인 필요 (web은 File[])
        uploadedKeys = await uploadImages.mutateAsync(
          imagesToUpload.map((img) => ({
            uri: img.uri,
            name: img.fileName,
            type: img.mimeType,
          })) as unknown as File[]
        );
      }

      const imageKeys = [...existingImageKeys, ...uploadedKeys].slice(
        0,
        MAX_IMAGE_COUNT
      );

      await onSubmit({
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        imageKeys,
      });
    } catch (error) {
      console.error(
        mode === "create" ? "정보글 생성 실패" : "정보글 수정 실패",
        error
      );
      showErrorMessage(
        mode === "create"
          ? "정보글 생성에 실패했습니다"
          : "정보글 수정에 실패했습니다"
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
        className="px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          disabled={isBusy}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
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
            제목<Text className="text-[#FF6B6B]"> *</Text>
          </Text>
          <TextInput
            value={form.title}
            editable={!isBusy}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            placeholder="정보글 제목을 입력해주세요"
            placeholderTextColor="#989898"
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center gap-1">
            <Text className="text-[13px] font-bold text-[#B0B0B0]">
              카테고리<Text className="text-[#FF6B6B]"> *</Text>
            </Text>
            {mode === "edit" && (
              <Text className="text-[11px] text-[#9A9A9A]">
                (수정할 수 없습니다)
              </Text>
            )}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {infoPostCategoryOptions.map((category) => {
              const value = category.value as InfoPostCategory;
              const isSelected = form.category === value;
              const color = categoryColorMap[value];
              return (
                <Pressable
                  key={category.value}
                  disabled={mode === "edit" || isBusy}
                  onPress={() => setForm((p) => ({ ...p, category: value }))}
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
                  className="rounded-3xl px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Text
                    style={
                      isSelected
                        ? { color: darkenColor(color, 140) }
                        : { color: "#2C2C2C" }
                    }
                    className="text-[13px] font-medium"
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            이미지
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {existingImages.map((image) => (
              <View
                key={image.imageKey}
                style={{ width: 150, height: 150 }}
                className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]"
              >
                <Image
                  source={{ uri: image.imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => handleRemoveExistingImage(image.imageKey)}
                  disabled={isBusy}
                  style={{ position: "absolute", top: 6, right: 6 }}
                  className="h-6 w-6 items-center justify-center rounded-full bg-black/60"
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ))}

            {selectedImages.map((image, index) => (
              <View
                key={image.uri}
                style={{ width: 150, height: 150 }}
                className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]"
              >
                <Image
                  source={{ uri: image.uri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => handleRemoveSelectedImage(index)}
                  disabled={isBusy}
                  style={{ position: "absolute", top: 6, right: 6 }}
                  className="h-6 w-6 items-center justify-center rounded-full bg-black/50"
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ))}

            {totalImageCount < MAX_IMAGE_COUNT && (
              <Pressable
                onPress={handlePickImages}
                disabled={isBusy}
                style={{ width: 150, height: 150 }}
                className="items-center justify-center rounded-xl border-2 border-dashed border-[#D6DDE5] bg-[#F6F8FA]"
              >
                <ImagePlus size={24} color="#9C9C9C" />
              </Pressable>
            )}
          </View>
          <Text className="mt-2 text-[11px] text-[#B0B0B0]">
            이미지 최대 3장 · 현재 {totalImageCount}장
          </Text>
        </View>

        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            내용<Text className="text-[#FF6B6B]"> *</Text>
          </Text>
          <TextInput
            value={form.content}
            editable={!isBusy}
            onChangeText={(v) => setForm((p) => ({ ...p, content: v }))}
            multiline
            textAlignVertical="top"
            placeholder="공유할 정보를 입력해주세요"
            placeholderTextColor="#B0B0B0"
            style={{ minHeight: 220 }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] p-4 text-[#2C2C2C]"
          />
        </View>

        <View className="mt-8 flex-row justify-center gap-3">
          {mode === "edit" && onDelete && (
            <Pressable
              onPress={onDelete}
              disabled={isBusy}
              className="rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-8 py-3 transition-transform duration-150 ease-out active:scale-95"
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
                  {uploadImages.isPending ? "이미지 업로드 중" : "처리 중"}
                </Text>
              </View>
            ) : (
              <Text className="text-[15px] font-semibold text-white">
                {mode === "create" ? "등록" : "수정"}
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
                정보글을 생성할까요?
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
