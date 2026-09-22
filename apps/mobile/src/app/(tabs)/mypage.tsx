import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Check,
  Pen,
  Camera,
  ChevronRight,
  LogOut,
  SquarePen,
  Vote,
  UserRoundPlus,
  Bookmark,
  MessageCircleQuestion,
  Settings,
} from "lucide-react-native";
import { colleges } from "@moimi/core/constants/departments";
import {
  useMyProfile,
  useUpdateMyProfile,
  useProfilePresignedUrl,
  useUploadProfileImage,
} from "@moimi/core/hooks/useUserQuery";
import { useAuth } from "@/contexts/AuthContext";
import SelectField from "@/components/SelectField";
import SettingsModal from "@/components/SettingsModal";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/default-profile.png");

const menuItems = [
  { icon: SquarePen, title: "내가 작성한 글", path: "/mypage/mypost" },
  { icon: Vote, title: "내 투표", path: "/mypage/votes" },
  { icon: UserRoundPlus, title: "초대 이력", path: "/mypage/invitations" },
  { icon: Bookmark, title: "스크랩", path: "/mypage/scraps" },
  { icon: MessageCircleQuestion, title: "문의하기", path: "/mypage/inquiry" },
] as const;

const departmentOptions = colleges.flatMap((college) =>
  college.departments.map((department) => ({
    label: `${college.name} · ${department.name}`,
    value: department.value,
  }))
);

function VerifyBadgeRing() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[
          "transparent",
          "#FFB3B3",
          "#F07272",
          "transparent",
          "transparent",
        ]}
        locations={[0, 0.25, 0.45, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

export default function MyPageScreen() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { data: profileData, isError } = useMyProfile();
  const { mutate: updateMyProfileMutate, isPending: isUpdatePending } =
    useUpdateMyProfile();
  const {
    mutateAsync: presignedUrlMutateAsync,
    isPending: isPresignedPending,
  } = useProfilePresignedUrl();
  const { mutateAsync: uploadImageMutateAsync, isPending: isUploadPending } =
    useUploadProfileImage();

  const [modify, setModify] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [editProfileImageUri, setEditProfileImageUri] = useState<string | null>(
    null
  );
  const [editImageKey, setEditImageKey] = useState<string | null>(null);
  const [isDefaultImageSelected, setIsDefaultImageSelected] = useState(false);
  const [isProfileImageMenuOpen, setIsProfileImageMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isImagePending = isPresignedPending || isUploadPending;

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const currentCollege = colleges.find((college) =>
    college.departments.some(
      (department) => department.value === profileData?.department
    )
  );

  const extractImageKey = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    try {
      return decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/+/, ""));
    } catch {
      return null;
    }
  };

  const startModify = () => {
    if (!profileData) return;
    setEditProfileImageUri(profileData.imageUrl ?? null);
    setEditImageKey(null);
    setIsDefaultImageSelected(false);
    setEditName(profileData.name);
    setEditEmail(profileData.email);
    setEditDepartment(profileData.department);
    setPassword("");
    setCheckPassword("");
    setModify(true);
  };

  const saveModify = () => {
    if (!profileData) return;

    if (password || checkPassword) {
      if (password !== checkPassword) {
        showErrorMessage("새 비밀번호를 확인해주세요");
        return;
      }
    }

    if (!editName.trim() || !editEmail.trim() || !editDepartment) {
      showErrorMessage("이름, 이메일, 학과를 모두 입력해주세요");
      return;
    }

    const existingImageKey = extractImageKey(profileData.imageUrl);

    setModify(false);
    setPassword("");
    setCheckPassword("");

    updateMyProfileMutate(
      {
        email: editEmail.trim(),
        name: editName.trim(),
        department: editDepartment,
        ...(isDefaultImageSelected
          ? { imageKey: null }
          : editImageKey
          ? { imageKey: editImageKey }
          : existingImageKey
          ? { imageKey: existingImageKey }
          : {}),
        ...(password ? { password } : {}),
      },
      {
        onSuccess: () => {
          setEditImageKey(null);
          setIsDefaultImageSelected(false);
        },
        onError: () => showErrorMessage("프로필 수정에 실패했어요"),
      }
    );
  };

  const handleSelectDefaultImage = () => {
    setEditProfileImageUri(null);
    setEditImageKey(null);
    setIsDefaultImageSelected(true);
    setIsProfileImageMenuOpen(false);
  };

  // 변경
  const openImagePicker = () => {
    return new Promise<ImagePicker.ImagePickerResult>((resolve) => {
      setTimeout(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        resolve(result);
      }, 400);
    });
  };

  const handlePickProfileImage = async () => {
    setIsProfileImageMenuOpen(false);
    const result = await openImagePicker();
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `image-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? "image/jpeg";
    const previousImage = editProfileImageUri;

    setEditProfileImageUri(asset.uri);
    setIsDefaultImageSelected(false);

    try {
      const { uploadUrl, imageKey } = await presignedUrlMutateAsync({
        fileName,
        contentType: mimeType,
      });

      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: mimeType });

      await uploadImageMutateAsync({
        uploadUrl,
        file: blob as unknown as File,
      });

      setEditImageKey(imageKey);
    } catch {
      setEditProfileImageUri(previousImage);
      showErrorMessage("이미지 업로드에 실패했어요");
    }
  };

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authLogout();
    } finally {
      router.replace("/login");
    }
  };

  if (isError || !profileData) return null;

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      {errorMessage ? (
        <View
          style={{
            position: "absolute",
            top: 60,
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 76,
          paddingBottom: 120,
          paddingHorizontal: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <View className="relative rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-6">
          {!modify && (
            <Pressable
              onPress={startModify}
              className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-[#EEF1F5] transition-transform duration-150 ease-out active:scale-90"
            >
              <Pen size={14} strokeWidth={2.5} color="#989898" />
            </Pressable>
          )}

          <View className="items-center mt-4 mb-4">
            <View className="relative h-36 w-36">
              <Image
                source={
                  modify
                    ? editProfileImageUri
                      ? { uri: editProfileImageUri }
                      : DEFAULT_PROFILE_IMAGE
                    : profileData.imageUrl
                    ? { uri: profileData.imageUrl }
                    : DEFAULT_PROFILE_IMAGE
                }
                className="h-full w-full rounded-full"
                resizeMode="cover"
              />
              {modify ? (
                <Pressable
                  onPress={() => setIsProfileImageMenuOpen(true)}
                  disabled={isImagePending}
                  style={{ opacity: isImagePending ? 0.5 : 1 }}
                  className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-[#5E92F0] transition-transform duration-150 ease-out active:scale-90"
                >
                  <Camera size={17} color="#fff" />
                </Pressable>
              ) : profileData.isSchoolVerified ? (
                <View className="absolute bottom-1 right-1 h-[34px] w-[34px] items-center justify-center rounded-full bg-[#A7ECA7]">
                  <Check size={19} strokeWidth={2.5} color="#2C6E2C" />
                </View>
              ) : (
                <View className="absolute -right-4 bottom-1">
                  <View
                    style={{
                      borderRadius: 999,
                      overflow: "hidden",
                      padding: 2,
                    }}
                  >
                    <VerifyBadgeRing />
                    <Pressable
                      onPress={() => router.push("/mypage/authentication")}
                      style={{ zIndex: 1 }}
                      className="rounded-full bg-[#E75A5A] px-3 py-1.5 transition-transform duration-150 ease-out active:scale-90"
                    >
                      <Text className="text-[12px] font-medium text-white">
                        학교 인증
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {!modify && (
              <View className="items-center">
                <Text className="mt-6 text-[22px] font-bold text-[#2C2C2C]">
                  {profileData.name}
                </Text>
                <Text className="mt-1 text-[15px] text-[#989898]">
                  @{profileData.username}
                </Text>
                <Text className="mt-4 text-[14px] text-[#989898]">
                  {currentCollege?.name} ·{" "}
                  {
                    currentCollege?.departments.find(
                      (d) => d.value === profileData.department
                    )?.name
                  }
                </Text>
                {profileData.isSchoolVerified && (
                  <Text className="mt-1 text-[14px] text-[#989898]">
                    {profileData.studentNumber}
                  </Text>
                )}
              </View>
            )}
          </View>

          {modify && (
            <View className="mt-6">
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="이름"
                className="mb-2 rounded-xl border border-[#D6DDE5]/60 bg-white px-2 py-4 pl-4 text-[#2C2C2C]"
              />
              <TextInput
                value={profileData.username}
                editable={false}
                className="mb-2 rounded-xl border border-[#D6DDE5]/60 bg-[#F5F5F5] px-2 py-4 pl-4 text-[#989898]"
              />
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="이메일"
                autoCapitalize="none"
                className="mb-2 rounded-xl border border-[#D6DDE5]/60 bg-white px-2 py-4 pl-4 text-[#2C2C2C]"
              />
              <SelectField
                value={editDepartment}
                onChange={setEditDepartment}
                options={departmentOptions}
                placeholder="학과 선택"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="새 비밀번호"
                secureTextEntry
                className="mb-2 mt-2 rounded-xl border border-[#D6DDE5]/60 bg-white px-2 py-4 pl-4 text-[#2C2C2C]"
              />
              <TextInput
                value={checkPassword}
                onChangeText={setCheckPassword}
                placeholder="새 비밀번호 확인"
                secureTextEntry
                className="mb-3 rounded-xl border border-[#D6DDE5]/60 bg-white px-2 py-4 pl-4 text-[#2C2C2C]"
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={saveModify}
                  disabled={isUpdatePending || isImagePending}
                  className="flex-1 rounded-xl bg-[#5E92F0] py-3.5 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[15px] font-semibold text-white">
                    완료
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setModify(false)}
                  disabled={isUpdatePending || isImagePending}
                  className="flex-1 rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-3.5 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[15px] font-semibold text-[#2c2c2c]">
                    취소
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* MY 메뉴 */}
        <View className="mt-4 rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-6">
          <Text className="text-[18px] font-bold text-[#2C2C2C]">MY</Text>
          <View className="mt-4 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.path)}
                  className="min-h-[64px] flex-row items-center gap-4 rounded-2xl bg-[#F6F8FA] px-5 transition-transform duration-150 ease-out active:scale-[0.98]"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Icon size={18} strokeWidth={2} color="#5E92F0" />
                  </View>
                  <Text className="flex-1 text-[16px] font-medium text-[#2C2C2C]">
                    {item.title}
                  </Text>
                  <ChevronRight size={16} color="#B0B8C1" />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 설정 / 로그아웃 */}
        <View className="mt-4 flex-row items-center justify-end gap-2">
          <Pressable
            onPress={() => setIsSettingsOpen(true)}
            className="flex-row items-center gap-1.5 px-3 py-1 border-r  border-[#D6DDE5] active:opacity-70"
          >
            <Settings size={14} color="#2C2C2C99" />
            <Text className="text-[13px] font-medium text-[#2C2C2C]/60">
              설정
            </Text>
          </Pressable>

          <Pressable
            onPress={logout}
            disabled={isLoggingOut}
            style={{ opacity: isLoggingOut ? 0.5 : 1 }}
            className="flex-row items-center gap-1.5 rounded-xl pr-3 pl-1.5 py-1 active:opacity-70"
          >
            <LogOut size={14} color="#2C2C2C99" />
            <Text className="text-[13px] font-medium text-[#2C2C2C]/60">
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </Pressable>
        </View>

        <SettingsModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          showErrorMessage={showErrorMessage}
          onDeleted={async () => {
            await authLogout();
            router.replace("/login");
          }}
        />
      </ScrollView>

      {isProfileImageMenuOpen && (
        <Modal
          transparent
          animationType="fade"
          visible={isProfileImageMenuOpen}
          onRequestClose={() => setIsProfileImageMenuOpen(false)}
        >
          <Pressable
            onPress={() => setIsProfileImageMenuOpen(false)}
            className="flex-1 items-center justify-center bg-black/40 px-6"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] rounded-3xl bg-white p-6"
            >
              <Text className="text-center text-xl font-bold text-[#2C2C2C]">
                프로필 이미지 변경
              </Text>
              <Text className="mt-1 text-center text-[15px] text-[#989898]">
                사용할 이미지를 선택해주세요
              </Text>

              <View className="mt-4 gap-3">
                <Pressable
                  onPress={handleSelectDefaultImage}
                  className="w-full items-center rounded-xl border border-[#D6DDE5]/40 bg-[#F6F8FA] h-12 justify-center transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-[#2C2C2C]">
                    기본 이미지 적용
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePickProfileImage}
                  className="w-full items-center rounded-xl bg-[#5E92F0] h-12 justify-center transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-white">
                    사진 찾아보기
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsProfileImageMenuOpen(false)}
                  className="w-full items-center py-2"
                >
                  <Text className="text-[14px] font-medium text-[#989898]">
                    취소
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
