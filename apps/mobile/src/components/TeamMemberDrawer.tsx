import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { MoreVertical, Search } from "lucide-react-native";
import type { TeamMemberResponse } from "@moimi/core/types/team";
import type { InvitationCandidateStatus } from "@moimi/core/types/invitation";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import { formatChatTime } from "@/utils/date/formatChatTime";
import { maskStudentNumber } from "@/utils/user/maskStudentNumber";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { useCreateDirectChatRoom } from "@moimi/core/hooks/chat/useCreateDirectChatRoom";
import { useTeamChatRoom } from "@moimi/core/hooks/chat/useTeamChatRoom";
import {
  useKickMember,
  useLeaveTeam,
  useUpdateMemberRole,
} from "@moimi/core/hooks/team/useTeamQuery";
import { useInvitationCandidates } from "@moimi/core/hooks/team/useTeamInvitationQuery";
import ChatRoomAvatar from "@/components/chatRoomAvatar";

const DRAWER_WIDTH = Math.min(360, Dimensions.get("window").width * 0.85);

type TabKey = "members" | "chats";

const TABS: { key: TabKey; label: string }[] = [
  { key: "members", label: "멤버 목록" },
  { key: "chats", label: "팀 채팅방" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ConfirmTarget =
  | { type: "kick"; member: TeamMemberResponse }
  | { type: "leave" }
  | { type: "transferLeader"; member: TeamMemberResponse }
  | null;

type TeamMemberDrawerProps = {
  open: boolean;
  onClose: () => void;
  teamId: number;
  teamMembers: TeamMemberResponse[];
  isAdmin: boolean;
  onInvite: (studentNumber: string) => Promise<void>;
  isInviting: boolean;
};

export default function TeamMemberDrawer({
  open,
  onClose,
  teamId,
  teamMembers,
  isAdmin,
  onInvite,
  isInviting,
}: TeamMemberDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("members");
  const [openMenuMember, setOpenMenuMember] =
    useState<TeamMemberResponse | null>(null);
  const [menuAnchorTop, setMenuAnchorTop] = useState<number | null>(null);
  const menuButtonRefs = useRef<Record<number, any>>({});

  const handleOpenMemberMenu = (member: TeamMemberResponse) => {
    const ref = menuButtonRefs.current[member.teamMemberId];
    if (!ref) return;
    ref.measureInWindow(
      (_x: number, y: number, _width: number, height: number) => {
        setMenuAnchorTop(y + height + 4);
        setOpenMenuMember(member);
      }
    );
  };
  const [keyword, setKeyword] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 탭 인디케이터 애니메이션 (TeamScreen 카테고리 탭과 동일 패턴)
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleTabLayout = (value: TabKey) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[value] = { x, width };
    if (value === activeTab && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleSelectTab = (value: TabKey) => {
    setActiveTab(value);
    const layout = tabLayouts.current[value];
    if (layout) {
      const springConfig = { damping: 30, stiffness: 450, mass: 1 };
      indicatorX.value = withSpring(layout.x, springConfig);
      indicatorWidth.value = withSpring(layout.width, springConfig);
    }
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    width: indicatorWidth.value,
  }));

  // 드로어 슬라이드 애니메이션 (웹의 overlay 0.2s / aside 0.25s + cubic-bezier(0.32,0.72,0,1)에 맞춤)
  const [internalVisible, setInternalVisible] = useState(open);
  const drawerX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setInternalVisible(true);
      drawerX.setValue(DRAWER_WIDTH);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drawerX, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (internalVisible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drawerX, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [open]);

  const { data: searchedUsers = [] } = useInvitationCandidates(teamId, keyword);
  const { data: me } = useMyInfo();
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();
  const { data: teamChatRooms, isLoading: isChatRoomsLoading } =
    useTeamChatRoom(teamId);
  const { mutate: kickMember, isPending: isKicking } = useKickMember(teamId);
  const { mutate: leaveTeamMutate, isPending: isLeaving } = useLeaveTeam();
  const { mutate: updateMemberRole, isPending: isAssigning } =
    useUpdateMemberRole(teamId);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 2000);
  };
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const filteredUsers = searchedUsers
    .filter((u) => u.userId !== me?.userId)
    .map((u) => ({
      studentNumber: u.studentNumber,
      name: u.name,
      invitationStatus: u.invitationStatus,
    }));

  const roleOrder: Record<TeamMemberResponse["teamRole"], number> = {
    LEADER: 0,
    MANAGER: 1,
    MEMBER: 2,
  };
  const sortedTeamMembers = [...teamMembers].sort(
    (a, b) => roleOrder[a.teamRole] - roleOrder[b.teamRole]
  );

  const handleInvite = async (studentNumber: string) => {
    try {
      await onInvite(studentNumber);
      showSuccess("초대 요청을 보냈어요");
    } catch {}
  };

  const handleToggleManager = (member: TeamMemberResponse) => {
    setOpenMenuMember(null);
    setMenuAnchorTop(null);
    const nextRole = member.teamRole === "MANAGER" ? "MEMBER" : "MANAGER";
    updateMemberRole(
      { memberId: member.teamMemberId, teamRole: nextRole },
      {
        onError: () =>
          showError(
            nextRole === "MANAGER"
              ? "매니저 지정에 실패했어요"
              : "매니저 해제에 실패했어요"
          ),
      }
    );
  };

  const handleDirectMessage = async (member: TeamMemberResponse) => {
    setOpenMenuMember(null);
    setMenuAnchorTop(null);
    const room = await createDirectRoom(member.userId);
    // router.push({
    //   pathname: `/chat/${room.chatRoomId}`,
    //   params: { roomName: room.roomName, roomType: room.chatRoomType },
    // });
  };

  const handleClose = () => {
    setOpenMenuMember(null);
    setMenuAnchorTop(null);
    setConfirmTarget(null);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={internalVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        <AnimatedPressable
          onPress={handleClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            opacity: overlayOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
          }}
        />

        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: DRAWER_WIDTH,
            height: "100%",
            paddingTop: 80,
            transform: [{ translateX: drawerX }],
          }}
          className="bg-white px-5"
        >
          {/* 탭 */}
          <View className="relative flex-row border-b-[0.5px] border-[#D6DDE5]">
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onLayout={handleTabLayout(tab.key)}
                onPress={() => handleSelectTab(tab.key)}
                className="flex-1 items-center pb-4"
              >
                <Text
                  className={`text-[16px] font-bold ${
                    activeTab === tab.key ? "text-[#5E92F0]" : "text-[#CBD2DA]"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}

            <ReAnimated.View
              className="absolute bottom-0 h-[2px] bg-[#5E92F0]"
              style={indicatorStyle}
            />
          </View>

          {activeTab === "members" ? (
            <View className="flex-1">
              {isAdmin && (
                <View className="mt-3 flex-row items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-3 py-3">
                  <Search size={14} color="#989898" />
                  <TextInput
                    value={keyword}
                    onChangeText={setKeyword}
                    placeholder="이름 검색 후 초대"
                    placeholderTextColor="#989898"
                    className="flex-1 text-[14px] text-[#2C2C2C]"
                  />
                </View>
              )}

              {isAdmin && keyword.length > 0 && (
                <View
                  style={{ maxHeight: 180 }}
                  className="mt-2 rounded-xl border-[0.5px] border-[#D6DDE5]"
                >
                  <ScrollView>
                    {filteredUsers.map((user) => {
                      const isPending = user.invitationStatus === "PENDING";
                      const isMember = user.invitationStatus === "MEMBER";
                      const disabled = isInviting || isPending || isMember;

                      return (
                        <View
                          key={user.studentNumber}
                          className="flex-row items-center justify-between px-3 py-2.5"
                        >
                          <View>
                            <Text className="text-[14px] font-medium text-[#2C2C2C]">
                              {user.name}
                            </Text>
                            <Text className="text-[12px] text-[#989898]">
                              {maskStudentNumber(user.studentNumber)}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => handleInvite(user.studentNumber)}
                            disabled={disabled}
                            style={{ opacity: disabled ? 0.5 : 1 }}
                            className="rounded-full bg-[#5E92F0] px-3 py-1.5"
                          >
                            <Text className="text-[12px] font-semibold text-white">
                              {isMember
                                ? "팀원"
                                : isPending
                                ? "초대 대기"
                                : "추가"}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text className="mt-3 text-[12px] font-medium text-[#989898]">
                멤버 ({sortedTeamMembers.length})
              </Text>

              <ScrollView
                className="mt-2 flex-1"
                showsVerticalScrollIndicator={false}
              >
                {sortedTeamMembers.map((member) => (
                  <View
                    key={member.teamMemberId}
                    className="mb-2 flex-row items-center justify-between rounded-xl bg-[#F8F9FB] py-2.5 pl-1 pr-3"
                  >
                    <View className="flex-1 flex-row items-center">
                      <Text
                        style={{ width: 60 }}
                        className="border-r-[0.5px] border-[#D6DDE5] text-center text-[14px] font-semibold text-[#2C2C2C]"
                      >
                        {member.userNickname}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={{ flex: 1 }}
                        className="px-3 text-[12px] text-[#989898]"
                      >
                        {getDepartmentName(member.department)}
                      </Text>

                      <View
                        className={`rounded-xl px-3 py-1.5 ${
                          member.teamRole === "LEADER"
                            ? "bg-[#5E92F0]"
                            : "bg-[#EEF1F5]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-semibold ${
                            member.teamRole === "LEADER"
                              ? "text-white"
                              : member.teamRole === "MANAGER"
                              ? "text-[#5E92F0]"
                              : "text-[#989898]"
                          }`}
                        >
                          {getTeamRoleLabel(member.teamRole)}
                        </Text>
                      </View>
                    </View>

                    {member.userId !== me?.userId ? (
                      <Pressable
                        ref={(ref) => {
                          menuButtonRefs.current[member.teamMemberId] = ref;
                        }}
                        onPress={() => handleOpenMemberMenu(member)}
                        hitSlop={8}
                        className="ml-1 rounded-full p-1.5"
                      >
                        <MoreVertical size={16} color="#989898" />
                      </Pressable>
                    ) : (
                      <View className="ml-3 h-6 w-6 items-center justify-center rounded-full bg-[#EEF1F5]">
                        <Text className="text-[11px] font-semibold text-[#5E92F0]">
                          나
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <ScrollView
              className="mt-3 flex-1"
              showsVerticalScrollIndicator={false}
            >
              {isChatRoomsLoading ? (
                <View className="h-[100px] items-center justify-center">
                  <Text className="text-[13px] text-[#989898]">
                    불러오는 중...
                  </Text>
                </View>
              ) : teamChatRooms && teamChatRooms.length > 0 ? (
                teamChatRooms.map((room) => (
                  <Pressable
                    key={room.chatRoomId}
                    // onPress={() =>
                    //   router.push({
                    //     pathname: `/chat/${room.chatRoomId}`,
                    //     params: {
                    //       roomName: room.roomName,
                    //       roomType: room.chatRoomType,
                    //     },
                    //   })
                    // }
                    className="mb-2 flex-row items-center gap-4 rounded-2xl bg-[#F6F8FB] px-3 py-4"
                  >
                    <ChatRoomAvatar
                      imageUrl={room.imageUrl}
                      memberProfileUrls={room.memberProfileUrls}
                      roomName={room.roomName}
                      chatRoomType={room.chatRoomType}
                      size={44}
                    />

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2">
                        <Text
                          numberOfLines={1}
                          className="flex-1 text-[14px] font-bold text-[#2C2C2C]"
                        >
                          {room.roomName}
                        </Text>
                        <Text className="text-[11px] text-[#B0B0B0]">
                          {formatChatTime(room.lastMessageAt)}
                        </Text>
                      </View>
                      <View className="mt-1 flex-row items-center justify-between gap-2">
                        <Text
                          numberOfLines={1}
                          className="flex-1 text-[12px] text-[#989898]"
                        >
                          {room.lastMessage ?? "메시지를 보내보세요"}
                        </Text>
                        {room.unreadCount > 0 && (
                          <View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-[#5E92F0] px-1.5">
                            <Text className="text-[11px] font-semibold text-white">
                              {room.unreadCount > 99 ? "99+" : room.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="h-[100px] items-center justify-center">
                  <Text className="text-[13px] text-[#989898]">
                    참여 중인 채팅방이 없어요
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          <View className="mt-3 border-t-[0.5px] border-[#D6DDE5] pb-6 pt-3">
            <Pressable
              onPress={() => setConfirmTarget({ type: "leave" })}
              className="items-center rounded-xl py-3 active:bg-[#FDEEEE]"
            >
              <Text className="text-[14px] font-semibold text-[#E22222]">
                팀 나가기
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 멤버 액션 메뉴 (버튼 근처에 뜨는 작은 드롭다운) */}
        {openMenuMember && menuAnchorTop !== null && (
          <>
            <Pressable
              onPress={() => {
                setOpenMenuMember(null);
                setMenuAnchorTop(null);
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 150,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: menuAnchorTop,
                right: 24,
                width: 140,
                zIndex: 160,
              }}
              className="overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white py-1 shadow-md"
            >
              <Pressable
                onPress={() => handleDirectMessage(openMenuMember)}
                disabled={isCreatingRoom}
                className="px-4 py-3"
              >
                <Text className="text-[13px] text-[#2C2C2C]">1:1 채팅</Text>
              </Pressable>

              {isAdmin && (
                <>
                  <Pressable
                    onPress={() => handleToggleManager(openMenuMember)}
                    disabled={isAssigning}
                    className="px-4 py-3"
                  >
                    <Text className="text-[13px] text-[#2C2C2C]">
                      {openMenuMember.teamRole === "MANAGER"
                        ? "매니저 해제"
                        : "매니저 지정"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const member = openMenuMember;
                      setOpenMenuMember(null);
                      setMenuAnchorTop(null);
                      setConfirmTarget({ type: "transferLeader", member });
                    }}
                    className="px-4 py-3"
                  >
                    <Text className="text-[13px] text-[#2C2C2C]">
                      팀장 권한 넘기기
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const member = openMenuMember;
                      setOpenMenuMember(null);
                      setMenuAnchorTop(null);
                      setConfirmTarget({ type: "kick", member });
                    }}
                    className="px-4 py-3"
                  >
                    <Text className="text-[13px] text-[#E22222]">제거</Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {/* 확인 모달 (제거/팀장 넘기기/나가기) */}
        {confirmTarget && (
          <View
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
              onPress={() => setConfirmTarget(null)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="w-full max-w-[340px] rounded-3xl bg-white p-6">
              <Text className="text-center text-[18px] font-bold text-[#2C2C2C]">
                {confirmTarget.type === "kick"
                  ? `${confirmTarget.member.userNickname}님을 팀에서 내보낼까요?`
                  : confirmTarget.type === "transferLeader"
                  ? `${confirmTarget.member.userNickname}님에게 팀장 권한을 넘길까요?`
                  : "정말 팀을 나가시겠어요?"}
              </Text>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={() => setConfirmTarget(null)}
                  className="flex-1 items-center rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-4"
                >
                  <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                    취소
                  </Text>
                </Pressable>

                <Pressable
                  disabled={isKicking || isLeaving || isAssigning}
                  onPress={() => {
                    if (confirmTarget.type === "kick") {
                      kickMember(confirmTarget.member.teamMemberId, {
                        onSuccess: () => setConfirmTarget(null),
                        onError: () => {
                          showError("멤버 제거에 실패했어요");
                          setConfirmTarget(null);
                        },
                      });
                    } else if (confirmTarget.type === "transferLeader") {
                      updateMemberRole(
                        {
                          memberId: confirmTarget.member.teamMemberId,
                          teamRole: "LEADER",
                        },
                        {
                          onSuccess: () => {
                            setConfirmTarget(null);
                            handleClose();
                          },
                          onError: () => {
                            showError("팀장 권한 이전에 실패했어요");
                            setConfirmTarget(null);
                          },
                        }
                      );
                    } else {
                      leaveTeamMutate(teamId, {
                        onSuccess: () => {
                          setConfirmTarget(null);
                          handleClose();
                        },
                        onError: () => {
                          showError("팀장은 팀을 나갈 수 없어요");
                          setConfirmTarget(null);
                        },
                      });
                    }
                  }}
                  style={{
                    opacity: isKicking || isLeaving || isAssigning ? 0.5 : 1,
                  }}
                  className="flex-1 items-center rounded-xl bg-[#E22222] py-4"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    {confirmTarget.type === "kick"
                      ? "제거"
                      : confirmTarget.type === "transferLeader"
                      ? "넘기기"
                      : "나가기"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* 토스트 */}
        {(errorMessage || successMessage) && (
          <View
            style={{ position: "absolute", top: 100, left: 0, right: 0 }}
            className="items-center"
          >
            <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
              <Text className="text-[13px] font-semibold text-white">
                {errorMessage || successMessage}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
