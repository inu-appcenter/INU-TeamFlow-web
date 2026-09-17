import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Search } from "lucide-react-native";
import { useCreateGroupChatRoom } from "@moimi/core/hooks/chat/useCreateGroupChatRoom";
import { useCreateDirectChatRoom } from "@moimi/core/hooks/chat/useCreateDirectChatRoom";
import {
  useMyTeams,
  useTeamMembers,
} from "@moimi/core/hooks/team/useTeamQuery";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import { getTeamRoleLabel } from "@/utils/user/teamRole";

type Step = "team" | "members" | "name";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function GroupChatCreateModal({ visible, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("team");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    new Set()
  );
  const [keyword, setKeyword] = useState("");
  const [roomName, setRoomName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const { data: teamMembers, isLoading: isMembersLoading } = useTeamMembers(
    selectedTeamId ?? 0,
    step === "members" && !!selectedTeamId
  );
  const { data: me } = useMyInfo();
  const {
    data: myTeams,
    isLoading: isTeamsLoading,
    isError,
    error,
  } = useMyTeams();

  useEffect(() => {
    console.log("[myTeams]", { myTeams, isTeamsLoading, isError, error });
  }, [myTeams, isTeamsLoading, isError, error]);

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];
    const withoutMe = teamMembers.filter((m) => m.userId !== me?.userId);
    if (!keyword.trim()) return withoutMe;
    return withoutMe.filter((m) =>
      m.userNickname.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  }, [teamMembers, keyword, me?.userId]);

  const isAllSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.has(m.userId));

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        filteredMembers.forEach((m) => next.delete(m.userId));
      } else {
        filteredMembers.forEach((m) => next.add(m.userId));
      }
      return next;
    });
  };

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
    setSelectedMemberIds(new Set());
    setKeyword("");
    setStep("members");
  };

  const handleProceedToName = () => {
    if (selectedMemberIds.size === 0) return;
    setStep("name");
  };

  const { mutateAsync: createGroupRoom, isPending: isCreatingGroup } =
    useCreateGroupChatRoom();
  const { mutateAsync: createDirectRoom, isPending: isCreatingDirect } =
    useCreateDirectChatRoom();

  const isCreating = isCreatingGroup || isCreatingDirect;

  const resetAndClose = () => {
    setStep("team");
    setSelectedTeamId(null);
    setSelectedMemberIds(new Set());
    setKeyword("");
    setRoomName("");
    onClose();
  };

  const handleCreate = async () => {
    if (!selectedTeamId || selectedMemberIds.size === 0) return;
    try {
      const memberIds = Array.from(selectedMemberIds);

      const room =
        memberIds.length === 1
          ? await createDirectRoom(memberIds[0])
          : await createGroupRoom({
              teamId: selectedTeamId,
              memberIds,
              roomName: roomName.trim() || null,
            });

      resetAndClose();
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

  const isDirectOnly = selectedMemberIds.size === 1;

  const stepTitle =
    step === "team"
      ? "채팅 그룹방을 생성할 팀을 선택해주세요"
      : step === "members"
      ? "초대할 멤버를 선택해주세요"
      : "채팅방 이름을 입력해주세요";

  const handleBack = () => {
    if (step === "members") setStep("team");
    if (step === "name") setStep("members");
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={resetAndClose}
    >
      <Pressable
        onPress={resetAndClose}
        className="flex-1 items-center justify-center bg-black/20 px-4"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ maxHeight: 600 }}
          className="w-[95%] rounded-3xl bg-white px-6 py-6"
        >
          {errorMessage ? (
            <View
              style={{
                position: "absolute",
                top: -50,
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

          <View className="mb-4 flex-row items-center gap-2">
            {step !== "team" ? (
              <Pressable onPress={handleBack}>
                <ChevronLeft size={22} strokeWidth={2.5} color="#2C2C2C" />
              </Pressable>
            ) : (
              <View />
            )}
            <Text className="flex-1 text-xl font-bold text-[#2C2C2C]">
              {stepTitle}
            </Text>
          </View>

          {step === "team" && (
            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            >
              {isTeamsLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color="#9C9C9C" />
                </View>
              ) : myTeams?.length === 0 ? (
                <Text className="py-6 text-center text-sm text-[#9C9C9C]">
                  소속된 팀이 없어요
                </Text>
              ) : (
                <View className="gap-2">
                  {myTeams?.map((team) => (
                    <Pressable
                      key={team.teamId}
                      onPress={() => handleSelectTeam(team.teamId)}
                      className="flex-row items-center gap-3 rounded-2xl bg-[#F8F9FB] p-3 transition-transform duration-150 ease-out active:scale-95"
                    >
                      <View className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#D6DDE5]">
                        {team.imageUrl ? (
                          <Image
                            source={{ uri: team.imageUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-full w-full items-center justify-center">
                            <Text className="text-sm font-bold text-[#3F4852]">
                              {team.name.slice(0, 1)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-[15px] font-bold text-[#2C2C2C]"
                        >
                          {team.name}
                        </Text>
                        <Text className="text-xs text-[#989898]">
                          멤버 {team.memberCount}명
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {step === "members" && (
            <>
              <View className="mb-2 flex-row items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-3 h-10">
                <Search size={14} color="#989898" />
                <TextInput
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder="이름으로 검색"
                  className="flex-1 text-sm"
                />
              </View>

              <Pressable
                onPress={toggleSelectAll}
                disabled={filteredMembers.length === 0}
                style={{ opacity: filteredMembers.length === 0 ? 0.4 : 1 }}
                className="mb-2 flex-row items-center gap-2 rounded-xl px-2 py-2"
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isAllSelected
                      ? "border-[#5E92F0] bg-[#5E92F0]"
                      : "border-[#D6DDE5] bg-white"
                  }`}
                >
                  {isAllSelected && (
                    <Check size={11} color="#fff" strokeWidth={3} />
                  )}
                </View>
                <Text className="text-sm font-semibold text-[#5E92F0]">
                  전체 선택
                </Text>
              </Pressable>

              <ScrollView
                style={{ maxHeight: 320 }}
                showsVerticalScrollIndicator={false}
              >
                {isMembersLoading ? (
                  <View className="items-center py-6">
                    <ActivityIndicator size="small" color="#9C9C9C" />
                  </View>
                ) : filteredMembers.length === 0 ? (
                  <Text className="py-6 text-center text-sm text-[#9C9C9C]">
                    검색 결과가 없어요
                  </Text>
                ) : (
                  <View className="gap-1">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMemberIds.has(member.userId);
                      return (
                        <Pressable
                          key={member.teamMemberId}
                          onPress={() => toggleMember(member.userId)}
                          className={`flex-row items-center justify-between rounded-2xl p-3 transition-transform duration-150 ease-out active:scale-95 ${
                            isSelected ? "bg-[#EEF3FE]" : "bg-[#F8F9FB]"
                          }`}
                        >
                          <View className="flex-1 flex-row items-center gap-3">
                            <View className="h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D6DDE5]">
                              {member.profileImageUrl ? (
                                <Image
                                  source={{ uri: member.profileImageUrl }}
                                  className="h-full w-full"
                                  resizeMode="cover"
                                />
                              ) : (
                                <Text className="text-sm font-bold text-[#3F4852]">
                                  {member.userNickname.slice(0, 1)}
                                </Text>
                              )}
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center gap-1">
                                <Text className="text-sm font-semibold text-[#2C2C2C]">
                                  {member.userNickname}
                                </Text>
                                <View
                                  className={`rounded-xl px-2 py-1 ${
                                    member.teamRole === "LEADER"
                                      ? "bg-[#5E92F0]"
                                      : "bg-[#EEF1F5]"
                                  }`}
                                >
                                  <Text
                                    className={`text-[10px] font-semibold ${
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
                              <Text className="mt-0.5 text-xs text-[#989898]">
                                {getDepartmentName(member.department)}
                              </Text>
                            </View>
                          </View>
                          <View
                            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? "border-[#5E92F0] bg-[#5E92F0]"
                                : "border-[#D6DDE5] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check size={13} color="#fff" strokeWidth={3} />
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              <Pressable
                onPress={handleProceedToName}
                disabled={selectedMemberIds.size === 0}
                style={{ opacity: selectedMemberIds.size === 0 ? 0.5 : 1 }}
                className="mt-4 items-center rounded-xl bg-[#5E92F0] py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  {selectedMemberIds.size > 0
                    ? `${selectedMemberIds.size}명 초대하고 다음`
                    : "초대할 멤버를 선택해주세요"}
                </Text>
              </Pressable>
            </>
          )}

          {step === "name" && (
            <>
              <View>
                {isDirectOnly ? (
                  <View className="items-center">
                    <Text className="mb-2 text-center text-[15px] font-semibold text-[#2C2C2C]">
                      1명과의 채팅은 1:1 채팅방으로 만들어져요
                    </Text>
                    <Text className=" text-center text-[14px] text-[#B0B0B0]">
                      이름은 자동으로 설정됩니다
                    </Text>
                  </View>
                ) : (
                  <>
                    <TextInput
                      value={roomName}
                      onChangeText={(text) => setRoomName(text.slice(0, 30))}
                      placeholder="예: 디자인팀 회의방"
                      maxLength={30}
                      autoFocus
                      className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 h-12 text-sm font-medium"
                    />
                    <Text className="mt-2 text-xs text-[#989898]">
                      입력하지 않으면 참여자 이름으로 자동 설정됩니다
                    </Text>
                  </>
                )}
              </View>

              <Pressable
                onPress={handleCreate}
                disabled={isCreating}
                style={{ opacity: isCreating ? 0.5 : 1 }}
                className="mt-4 items-center rounded-xl bg-[#5E92F0] py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  채팅방 만들기
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
