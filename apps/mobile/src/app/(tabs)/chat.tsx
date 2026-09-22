import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  LayoutChangeEvent,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useChatRooms } from "@moimi/core/hooks/chat/useChatRooms";
import { formatChatTime } from "@/utils/date/formatChatTime";
import ChatRoomAvatar from "@/components/chatRoomAvatar";
import GroupChatCreateModal from "@/components/GroupChatCreateModal";
import { useChatRoomListSubscription } from "@/hooks/chat/useChatRoomListSubscription";

type ChatTab = "TEAM" | "DIRECT";

const TABS: { key: ChatTab; label: string }[] = [
  { key: "TEAM", label: "팀 채팅" },
  { key: "DIRECT", label: "1:1 채팅" },
];

export default function ChatScreen() {
  useChatRoomListSubscription();
  const [activeTab, setActiveTab] = useState<ChatTab>("TEAM");
  const { data: teamRooms = [], isLoading: isTeamLoading } =
    useChatRooms("TEAM");
  const { data: groupRooms = [], isLoading: isGroupLoading } =
    useChatRooms("GROUP");
  const { data: directRooms = [], isLoading: isDirectLoading } =
    useChatRooms("DIRECT");

  const router = useRouter();

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleTabLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[key] = { x, width };
    if (key === activeTab && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectTab = (key: ChatTab) => {
    setActiveTab(key);
    const layout = tabLayouts.current[key];
    if (layout) {
      const springConfig = { damping: 34, stiffness: 450, mass: 1 };
      indicatorX.value = withSpring(layout.x, springConfig);
      indicatorWidth.value = withSpring(layout.width, springConfig);
    }
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    width: indicatorWidth.value,
  }));

  const chatRooms =
    activeTab === "DIRECT" ? directRooms : [...teamRooms, ...groupRooms];

  const isLoading =
    activeTab === "DIRECT" ? isDirectLoading : isTeamLoading || isGroupLoading;

  const hasUnread = {
    TEAM: [...teamRooms, ...groupRooms].some((room) => room.unreadCount > 0),
    DIRECT: directRooms.some((room) => room.unreadCount > 0),
  };

  const visibleRooms = chatRooms.filter((room) => {
    if (room.chatRoomType === "TEAM") return true;
    if (room.chatRoomType === "GROUP") return !!room.lastMessageAt;
    return true;
  });

  const filteredRooms = [...visibleRooms].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });

  return (
    <View
      className="flex-1 bg-[#F0F2F5]"
      style={{ paddingTop: 76, paddingHorizontal: 10 }}
    >
      <View className="mb-3 flex-row items-center justify-between pl-2">
        <Text className="text-[22px] font-bold text-[#2C2C2C]">
          나의 채팅 목록
        </Text>
        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          className="flex-row items-center gap-1.5 rounded-lg bg-[#5E92F0] py-3 pr-4 pl-3.5 transition-transform duration-150 ease-out active:scale-90"
        >
          <Plus size={16} strokeWidth={2.5} color="#fff" />
          <Text className="text-[14px] font-semibold text-white">
            채팅 생성하기
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 rounded-t-2xl border-[0.8px] border-b-0 border-[#D6DDE5] bg-white px-4 pb-20 pt-4">
        <View className="relative flex-row border-b-[0.5px] border-[#D6DDE5]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onLayout={handleTabLayout(tab.key)}
                onPress={() => handleSelectTab(tab.key)}
                className="flex-1 items-center  "
                style={{ height: 40 }}
              >
                <View className="flex-row items-center pt-1">
                  <Text
                    className={`text-[17px] font-bold ${
                      isActive ? "text-[#5E92F0]" : "text-[#CBD2DA]"
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {hasUnread[tab.key] && (
                    <View className="-top-3 -right-2 h-1.5 w-1.5 rounded-full bg-[#5E92F0]" />
                  )}
                </View>
              </Pressable>
            );
          })}

          <Animated.View
            className="absolute bottom-0 h-0.5 bg-[#5E92F0]"
            style={indicatorStyle}
          />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        >
          {isLoading ? (
            <Text className="py-10 text-center text-[13px] text-[#9C9C9C]">
              불러오는 중...
            </Text>
          ) : filteredRooms.length === 0 ? (
            <View className="items-center gap-2 py-16">
              <Text className="text-[13px] text-[#9C9C9C]">
                {activeTab === "TEAM"
                  ? "아직 팀 채팅방이 없어요"
                  : "아직 1:1 채팅방이 없어요"}
              </Text>
            </View>
          ) : (
            filteredRooms.map((room) => (
              <Pressable
                key={room.chatRoomId}
                onPress={() => {
                  router.push({
                    pathname: "/chat/[roomId]",
                    params: {
                      roomId: String(room.chatRoomId),
                      roomName: room.roomName,
                      roomImageUrl: room.imageUrl ?? "",
                      roomType: room.chatRoomType,
                      memberProfileUrls: JSON.stringify(
                        room.memberProfileUrls ?? []
                      ),
                    },
                  });
                }}
                className="mb-2 flex-row items-center gap-3 rounded-2xl bg-[#F6F8FA] p-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <ChatRoomAvatar
                  imageUrl={room.imageUrl}
                  memberProfileUrls={room.memberProfileUrls}
                  roomName={room.roomName}
                  chatRoomType={room.chatRoomType}
                  size={48}
                />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-[15px] font-bold text-[#2C2C2C]"
                    >
                      {room.roomName}
                    </Text>
                    <Text className="text-[11px] text-[#B0B0B0]">
                      {formatChatTime(room.lastMessageAt)}
                    </Text>
                  </View>
                  <View className="mt-0.5 flex-row items-center justify-between gap-2">
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-[13px] text-[#989898]"
                    >
                      {room.lastMessage ?? "메시지를 보내보세요"}
                    </Text>
                    {room.unreadCount > 0 && (
                      <View className="h-5 min-w-5 items-center justify-center rounded-full bg-[#5E92F0] px-1.5">
                        <Text className="text-[11px] font-semibold text-white">
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
      <GroupChatCreateModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </View>
  );
}
