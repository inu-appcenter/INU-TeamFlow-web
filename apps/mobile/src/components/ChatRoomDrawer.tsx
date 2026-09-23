import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  Modal,
  Animated,
  Easing,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  MoreVertical,
  Camera,
  Pencil,
  Plus,
  Search,
} from "lucide-react-native";
import { useCreateDirectChatRoom } from "@moimi/core/hooks/chat/useCreateDirectChatRoom";
import { useChatRoomMembers } from "@moimi/core/hooks/chat/useChatRoomMembers";
import { useChatRoomAvailableMembers } from "@moimi/core/hooks/chat/useChatRoomAvailableMembers";
import { useAddChatRoomMembers } from "@moimi/core/hooks/chat/useAddChatRoomMembers";
import { useLeaveChatRoom } from "@moimi/core/hooks/chat/useLeaveChatRoom";
import {
  useUpdateMyChatRoomName,
  useUpdateMyChatRoomImage,
} from "@moimi/core/hooks/chat/useUpdateMyChatRoomInfo";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { useCreateReport } from "@moimi/core/hooks/useCreateReport";
import { maskStudentNumber } from "@/utils/user/maskStudentNumber";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import ReportModal from "@/components/ReportModal";
import ChatRoomAvatar from "@/components/chatRoomAvatar";
import type { ChatRoomMemberResponse } from "@moimi/core/types/chat";
import type { ReportRequest } from "@moimi/core/types/report";

type RoomType = "TEAM" | "DIRECT" | "GROUP";

type ChatRoomDrawerProps = {
  open: boolean;
  onClose: () => void;
  roomId: number;
  roomType: RoomType;
  roomName: string;
  roomImageUrl: string | null;
  onInfoUpdated: (next: {
    roomName?: string;
    roomImageUrl?: string | null;
  }) => void;
};

const DRAWER_WIDTH = 320;

type AnchorRect = { x: number; y: number; width: number; height: number };

export default function ChatRoomDrawer({
  open,
  onClose,
  roomId,
  roomType,
  roomName,
  roomImageUrl,
  onInfoUpdated,
}: ChatRoomDrawerProps) {
  const router = useRouter();

  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(roomName);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [reportTarget, setReportTarget] =
    useState<ChatRoomMemberResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const avatarRef = useRef<View>(null);
  const [avatarMenu, setAvatarMenu] = useState<AnchorRect | null>(null);

  const memberMenuRefs = useRef<Record<number, View | null>>({});
  const [memberMenu, setMemberMenu] = useState<
    (AnchorRect & { member: ChatRoomMemberResponse }) | null
  >(null);
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();
  const { mutate: createReport, isPending: isReportSubmitting } =
    useCreateReport();
  const { data: me } = useMyInfo();
  const { data: members, isLoading: isMembersLoading } =
    useChatRoomMembers(roomId);

  const sortedMembers = useMemo(() => {
    if (!members) return members;
    const myUserId = me?.userId;
    const myself = members.filter((m) => m.userId === myUserId);
    const others = members
      .filter((m) => m.userId !== myUserId)
      .sort((a, b) => a.userNickname.localeCompare(b.userNickname, "ko"));
    return [...myself, ...others];
  }, [members, me?.userId]);

  const { data: availableMembers = [] } = useChatRoomAvailableMembers(
    roomId,
    keyword,
    roomType === "GROUP"
  );

  const { mutateAsync: addMembers, isPending: isAdding } =
    useAddChatRoomMembers(roomId);
  const { mutate: leaveRoom, isPending: isLeaving } = useLeaveChatRoom();
  const { mutateAsync: updateMyName, isPending: isRenaming } =
    useUpdateMyChatRoomName(roomId);
  const { mutateAsync: updateMyImage, isPending: isUpdatingImage } =
    useUpdateMyChatRoomImage(roomId);

  const toggleSelect = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleDirectMessage = async (member: ChatRoomMemberResponse) => {
    setMemberMenu(null);
    try {
      const room = await createDirectRoom(member.userId);
      onClose();
      router.push({
        pathname: "/chat/[roomId]",
        params: {
          roomId: String(room.chatRoomId),
          roomName: room.roomName,
          roomType: room.chatRoomType,
        },
      });
    } catch {
      showErrorMessage("채팅방 생성에 실패했어요");
    }
  };

  // 신고 모달을 띄우면서 드로어도 같이 닫는다.
  const handleOpenReport = (member: ChatRoomMemberResponse) => {
    setMemberMenu(null);
    setReportTarget(member);
    onClose();
  };

  const handleSubmitReport = ({ reason, detail }: ReportRequest) => {
    if (!reportTarget) return;
    createReport(
      {
        target: { type: "USER", id: reportTarget.userId },
        body: { reason, detail },
      },
      {
        onSuccess: () => {
          setReportTarget(null);
          showErrorMessage("신고가 접수되었습니다");
        },
        onError: () => showErrorMessage("신고 접수에 실패했습니다"),
      }
    );
  };

  const handleAddMembers = async () => {
    if (selectedIds.size === 0) return;
    try {
      await addMembers(Array.from(selectedIds));
      setSelectedIds(new Set());
      setKeyword("");
      setIsInviteOpen(false);
    } catch {
      showErrorMessage("멤버 추가에 실패했어요");
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === roomName) {
      setIsEditingName(false);
      return;
    }
    try {
      const updatedName = await updateMyName(trimmed);
      onInfoUpdated({ roomName: updatedName ?? trimmed });
      setIsEditingName(false);
    } catch {
      showErrorMessage("이름 변경에 실패했어요");
    }
  };

  const handleCancelNameEdit = () => {
    setNameDraft(roomName ?? "");
    setIsEditingName(false);
  };

  const handlePickAvatarImage = async () => {
    setAvatarMenu(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    try {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `image-${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";

      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: mimeType });
      (blob as unknown as File & { name: string }).name = fileName;

      const newUrl = await updateMyImage(blob as unknown as File);
      onInfoUpdated({ roomImageUrl: newUrl });
    } catch {
      showErrorMessage("이미지 변경에 실패했어요");
    }
  };

  const handleResetImage = async () => {
    setAvatarMenu(null);
    try {
      const newUrl = await updateMyImage(null);
      onInfoUpdated({ roomImageUrl: newUrl });
    } catch {
      showErrorMessage("이미지 초기화에 실패했어요");
    }
  };

  const handleLeave = () => {
    leaveRoom(roomId, {
      onSuccess: () => {
        setConfirmLeave(false);
        onClose();
        router.push("/(tabs)/chat");
      },
      onError: () => {
        showErrorMessage("채팅방 나가기에 실패했어요");
        setConfirmLeave(false);
      },
    });
  };

  const openAvatarMenu = () => {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setAvatarMenu({ x, y, width, height });
    });
  };

  const openMemberMenu = (member: ChatRoomMemberResponse) => {
    const ref = memberMenuRefs.current[member.userId];
    ref?.measureInWindow((x, y, width, height) => {
      setMemberMenu({ member, x, y, width, height });
    });
  };

  return (
    <>
      {mounted && (
        <Modal transparent animationType="none" onRequestClose={onClose}>
          {/* 배경 딤 */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.2)",
              opacity: backdropOpacity,
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Animated.View>

          {errorMessage ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 100,
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 50,
              }}
            >
              <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
                <Text className="text-sm font-semibold text-white">
                  {errorMessage}
                </Text>
              </View>
            </View>
          ) : null}

          {/* 드로어 패널 */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: DRAWER_WIDTH,
              backgroundColor: "#fff",
              paddingTop: 56,
              paddingHorizontal: 16,
              paddingBottom: 24,
              transform: [{ translateX }],
            }}
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  if (isEditingName) handleCancelNameEdit();
                }}
              >
                <View className="mt-6 items-center gap-4 ">
                  <Pressable
                    ref={avatarRef}
                    onPress={
                      roomType === "GROUP" && isEditingName
                        ? openAvatarMenu
                        : undefined
                    }
                    style={{ width: 80, height: 80 }}
                  >
                    <ChatRoomAvatar
                      imageUrl={roomImageUrl}
                      memberProfileUrls={
                        members
                          ?.map((m) => m.profileImageUrl)
                          .filter((url): url is string => !!url) ?? []
                      }
                      roomName={roomName}
                      chatRoomType={roomType}
                      size={80}
                    />
                    {roomType === "GROUP" && isEditingName && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                        className="items-center justify-center"
                      >
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-black/50">
                          <Camera size={12} color="#fff" />
                        </View>
                      </View>
                    )}
                  </Pressable>

                  {isEditingName ? (
                    <Pressable
                      onPress={() => {}}
                      className="w-full flex-row items-center gap-3"
                    >
                      <View
                        style={{ height: 35, justifyContent: "center" }}
                        className="flex-1 rounded-xl border-[0.5px] border-[#D6DDE5] px-3"
                      >
                        <TextInput
                          value={nameDraft}
                          onChangeText={(text) =>
                            setNameDraft(text.slice(0, 30))
                          }
                          onSubmitEditing={handleSaveName}
                          autoFocus
                          maxLength={30}
                          style={{ padding: 0, margin: 0 }}
                          className="text-sm"
                        />
                      </View>
                      <Pressable
                        onPress={handleSaveName}
                        disabled={isRenaming}
                        style={{ opacity: isRenaming ? 0.5 : 1 }}
                        className="rounded-lg bg-[#5E92F0] px-3 h-10 items-center flex justify-center"
                      >
                        <Text className="text-sm font-semibold text-white">
                          저장
                        </Text>
                      </Pressable>
                    </Pressable>
                  ) : roomType === "GROUP" ? (
                    <Pressable
                      onPress={() => {
                        setNameDraft(roomName);
                        setIsEditingName(true);
                      }}
                      className="mb-2 flex-row items-center gap-2"
                    >
                      <Text className="text-base font-bold text-[#2C2C2C]">
                        {roomName}
                      </Text>
                      <Pencil size={14} color="#989898" />
                    </Pressable>
                  ) : (
                    <Text className="text-base font-bold text-[#2C2C2C]">
                      {roomName}
                    </Text>
                  )}
                </View>

                <View className="mt-4 rounded-xl bg-[#F6F8FA] pb-3">
                  <Text className="px-4 pt-4 pb-2 text-xs font-medium text-[#989898]">
                    대화상대 ({members?.length ?? 0})
                  </Text>

                  {roomType === "GROUP" && isInviteOpen && (
                    <View className="mx-3 mb-2 flex-row items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-3 h-10">
                      <Search size={14} color="#989898" />
                      <View style={{ flex: 1, justifyContent: "center" }}>
                        <TextInput
                          value={keyword}
                          onChangeText={setKeyword}
                          placeholder="팀원 검색 후 초대"
                          autoFocus
                          style={{ padding: 0, margin: 0 }}
                          className="text-sm"
                        />
                      </View>
                    </View>
                  )}

                  {roomType === "GROUP" && isInviteOpen && keyword ? (
                    <View className="mx-3 mt-2 mb-2 max-h-[160px] overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white">
                      <ScrollView>
                        {availableMembers.map(
                          (user: {
                            userId: number;
                            name: string;
                            studentNumber: string;
                          }) => {
                            const isSelected = selectedIds.has(user.userId);
                            return (
                              <Pressable
                                key={user.userId}
                                onPress={() => toggleSelect(user.userId)}
                                className={`flex-row items-center justify-between px-3 py-2 ${
                                  isSelected ? "bg-[#EEF3FE]" : ""
                                }`}
                              >
                                <View>
                                  <Text className="text-sm font-medium text-[#2C2C2C]">
                                    {user.name}
                                  </Text>
                                  <Text className="text-xs text-[#989898]">
                                    {maskStudentNumber(user.studentNumber)}
                                  </Text>
                                </View>
                                {isSelected && (
                                  <Text className="text-xs font-semibold text-[#5E92F0]">
                                    선택됨
                                  </Text>
                                )}
                              </Pressable>
                            );
                          }
                        )}
                      </ScrollView>
                    </View>
                  ) : null}

                  {roomType === "GROUP" && selectedIds.size > 0 && (
                    <Pressable
                      onPress={handleAddMembers}
                      disabled={isAdding}
                      style={{ opacity: isAdding ? 0.5 : 1 }}
                      className="mx-3 mb-2 items-center rounded-xl bg-[#5E92F0] py-2"
                    >
                      <Text className="text-sm font-semibold text-white">
                        {selectedIds.size}명 초대하기
                      </Text>
                    </Pressable>
                  )}

                  <View className="px-2">
                    {roomType === "GROUP" && (
                      <Pressable
                        onPress={() => {
                          setIsInviteOpen((prev) => !prev);
                          if (isInviteOpen) {
                            setKeyword("");
                            setSelectedIds(new Set());
                          }
                        }}
                        className="flex-row items-center gap-3 rounded-xl px-2 py-1.5"
                      >
                        <View className="h-9 w-9 items-center justify-center rounded-full border border-dashed border-[#C5CDD6] bg-white">
                          <Plus size={16} color="#5E92F0" strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm font-semibold text-[#5E92F0]">
                          초대하기
                        </Text>
                      </Pressable>
                    )}

                    {isMembersLoading && !members ? (
                      <View className="mb-5 h-10 items-center justify-center">
                        <ActivityIndicator size="small" color="#9C9C9C" />
                      </View>
                    ) : (
                      sortedMembers?.map((member) => (
                        <View
                          key={member.userId}
                          className="flex-row items-center gap-3 rounded-xl px-2 py-1.5"
                        >
                          <View className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D6DDE5]">
                            {member.profileImageUrl && (
                              <Image
                                source={{ uri: member.profileImageUrl }}
                                className="h-full w-full"
                                resizeMode="cover"
                              />
                            )}
                          </View>

                          <View className="flex-1 flex-row items-center justify-between">
                            <View className="flex-1 flex-row items-center justify-between pr-2">
                              <Text className="text-sm font-medium text-[#2C2C2C]">
                                {member.userNickname}
                              </Text>
                              <Text className="text-xs font-medium text-[#989898]">
                                {getDepartmentName(member.department)}
                              </Text>
                            </View>

                            {member.userId === me?.userId ? (
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-[#EEF1F5]">
                                <Text className="text-[11px] font-semibold text-[#5E92F0]">
                                  나
                                </Text>
                              </View>
                            ) : (
                              <Pressable
                                ref={(ref) => {
                                  memberMenuRefs.current[member.userId] = ref;
                                }}
                                onPress={() => openMemberMenu(member)}
                                className="h-6 w-6 items-center justify-center rounded-full"
                              >
                                <MoreVertical size={16} color="#989898" />
                              </Pressable>
                            )}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </Pressable>
            </ScrollView>

            {roomType !== "TEAM" && (
              <View className="mt-3 border-t-[0.5px] border-[#D6DDE5] pt-3">
                <Pressable
                  onPress={() => setConfirmLeave(true)}
                  className="items-center rounded-xl py-2"
                >
                  <Text className="text-sm font-semibold text-[#E22222]">
                    채팅방 나가기
                  </Text>
                </Pressable>
              </View>
            )}
          </Animated.View>

          {avatarMenu && (
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 100,
              }}
              onPress={() => setAvatarMenu(null)}
            >
              <View
                style={{
                  position: "absolute",
                  top: avatarMenu.y + avatarMenu.height + 4,
                  left: avatarMenu.x,
                  width: 140,
                }}
                className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white py-1 shadow-md"
              >
                <Pressable
                  onPress={handlePickAvatarImage}
                  className="px-3 py-2.5"
                >
                  <Text className="text-xs text-[#2C2C2C]">사진 선택</Text>
                </Pressable>
                <Pressable onPress={handleResetImage} className="px-3 py-2.5">
                  <Text className="text-xs text-[#2C2C2C]">
                    기본 이미지 적용
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          )}

          {memberMenu && (
            <Pressable
              style={{
                position: "absolute",
                top: 30,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 100,
              }}
              onPress={() => setMemberMenu(null)}
            >
              <View
                style={{
                  position: "absolute",
                  top: memberMenu.y,
                  left: memberMenu.x - 120 + memberMenu.width,
                  width: 120,
                }}
                className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white py-1 shadow-md"
              >
                <Pressable
                  onPress={() => handleDirectMessage(memberMenu.member)}
                  disabled={isCreatingRoom}
                  className="px-4 py-3"
                >
                  <Text className="text-[13px] text-[#2C2C2C]">1:1 채팅</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleOpenReport(memberMenu.member)}
                  className="px-4 py-3"
                >
                  <Text className="text-[13px] text-[#E22222]">신고하기</Text>
                </Pressable>
              </View>
            </Pressable>
          )}

          {confirmLeave && (
            <Pressable
              onPress={() => setConfirmLeave(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 200,
              }}
              className="items-center justify-center bg-black/40 px-6"
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                className="w-full max-w-[340px] rounded-3xl bg-white p-6"
              >
                <Text className="text-center text-lg font-bold text-[#2C2C2C]">
                  정말 채팅방을 나가시겠어요?
                </Text>
                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    onPress={() => setConfirmLeave(false)}
                    className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3"
                  >
                    <Text className="text-sm font-semibold text-[#2C2C2C]">
                      취소
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleLeave}
                    disabled={isLeaving}
                    style={{ opacity: isLeaving ? 0.5 : 1 }}
                    className="flex-1 items-center rounded-xl bg-[#E22222] py-3"
                  >
                    <Text className="text-sm font-semibold text-white">
                      나가기
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          )}
        </Modal>
      )}

      {reportTarget && (
        <ReportModal
          key={reportTarget.userId}
          targetLabel={`${reportTarget.userNickname}님`}
          isSubmitting={isReportSubmitting}
          onClose={() => {
            if (isReportSubmitting) return;
            setReportTarget(null);
          }}
          onSubmit={handleSubmitReport}
        />
      )}
    </>
  );
}
