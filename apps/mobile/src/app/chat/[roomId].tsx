import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Keyboard } from "react-native";
import {
  ChevronLeft,
  ImagePlus,
  Send,
  Menu,
  ChevronDown,
} from "lucide-react-native";
import ChatRoomDrawer from "@/components/ChatRoomDrawer";
import { getChatImagePresignedUrl } from "@moimi/core/api/chat";
import { useChatMessageAnchor } from "@/hooks/chat/useChatMessageAnchor";
import { useChatMessageHistory } from "@moimi/core/hooks/chat/useChatMessageHistory";
import { useSendChatMessage } from "@moimi/core/hooks/chat/useSendChatMessage";
import { useChatImageUpload } from "@moimi/core/hooks/chat/useChatImageUpload";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { useChatSocketContext } from "@/contexts/ChatSocketContext";
import { useChatMessageSubscription } from "@/hooks/chat/useChatMessageSubscription";
import { useChatReadEventSubscription } from "@/hooks/chat/useChatReadEventSubscription";
import { useMarkRoomRead } from "@/hooks/chat/useMarkRoomRead";
import { isEmojiOnlyMessage } from "@/utils/chat/isEmojiOnly";
import {
  formatChatDate,
  isSameDay,
  isSameMinute,
} from "@/utils/date/formatChatDate";
import { formatChatMessageTime } from "@/utils/date/formatChatMessageTime";
import ChatRoomAvatar from "@/components/chatRoomAvatar";
import type { ChatMessageResponse } from "@moimi/core/types/chat";

type RoomType = "TEAM" | "DIRECT" | "GROUP";

type DisplayMessage = ChatMessageResponse & {
  showDateDivider: boolean;
  isSameSenderAsPrev: boolean;
  showTime: boolean;
  showReadDivider: boolean;
  unreadCount: number;
};

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const id = Number(roomId);
  return <ChatRoomScreenInner key={id} roomId={id} />;
}

function ChatRoomScreenInner({ roomId }: { roomId: number }) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    roomName?: string;
    roomImageUrl?: string;
    roomType?: RoomType;
    memberProfileUrls?: string;
  }>();

  const { data: anchor, isLoading } = useChatMessageAnchor(roomId);
  useEffect(() => {
    console.log(
      "[ChatRoomScreen] anchor 갱신, messages.length =",
      anchor?.messages.length
    );
  }, [anchor]);
  const [draft, setDraft] = useState("");
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const flatListRef = useRef<FlatList<DisplayMessage>>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const currentCount = anchor?.messages.length ?? 0;
    if (currentCount > prevMessageCountRef.current && !showScrollToBottom) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    prevMessageCountRef.current = currentCount;
  }, [anchor?.messages.length, showScrollToBottom]);

  const [isUploading, setIsUploading] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{
    roomType: RoomType;
    roomName: string;
    roomImageUrl: string | null;
  }>({
    roomType: params.roomType ?? "TEAM",
    roomName: params.roomName ?? "",
    roomImageUrl: params.roomImageUrl || null,
  });
  const { roomType, roomName, roomImageUrl } = roomInfo;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const memberProfileUrls = useMemo<string[] | null>(() => {
    try {
      const parsed = JSON.parse(params.memberProfileUrls ?? "null");
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  }, [params.memberProfileUrls]);

  const oldestLoadedId = anchor?.messages[0]?.chatMessageId;

  const {
    data: historyPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessageHistory(roomId, oldestLoadedId, !!anchor);

  const allMessages = useMemo<ChatMessageResponse[]>(() => {
    const older = historyPages?.pages.flatMap((p) => p.content) ?? [];
    const merged = [...older, ...(anchor?.messages ?? [])];
    const deduped = Array.from(
      new Map(merged.map((m) => [m.chatMessageId, m])).values()
    );
    return deduped.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [historyPages, anchor?.messages]);

  const { data: me } = useMyInfo();
  const currentUserId = me?.userId;
  const { isConnected } = useChatSocketContext();
  const { sendMessage } = useSendChatMessage(roomId);

  useChatMessageSubscription(roomId);
  useChatReadEventSubscription(roomId);

  const lastMessageId =
    anchor?.messages[anchor.messages.length - 1]?.chatMessageId;
  useMarkRoomRead(
    roomId,
    lastMessageId,
    anchor?.lastReadMessageId ?? undefined
  );

  // 방 진입 시점의 읽음 위치를 고정 (읽음 구분선이 화면 보는 도중 사라지지 않도록)
  const [frozenLastReadMessageId, setFrozenLastReadMessageId] = useState<
    number | null
  >(null);
  const hasFrozenReadDividerRef = useRef(false);
  useEffect(() => {
    if (anchor && !hasFrozenReadDividerRef.current) {
      setFrozenLastReadMessageId(anchor.lastReadMessageId);
      hasFrozenReadDividerRef.current = true;
    }
  }, [anchor]);

  // 시간순으로 렌더링 메타데이터를 먼저 계산한 뒤 inverted FlatList용으로 뒤집는다.
  // 웹의 scrollHeight 보정/IntersectionObserver는 FlatList의 inverted +
  // maintainVisibleContentPosition이 대체한다 (위로 스크롤 시 점프 없이 과거 메시지 로드).
  const listData = useMemo<DisplayMessage[]>(() => {
    const withMeta = allMessages.map((message, index) => {
      const prevMessage = allMessages[index - 1];
      const nextMessage = allMessages[index + 1];

      const showDateDivider =
        !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);
      const isSameSenderAsPrev =
        !showDateDivider &&
        prevMessage?.messageType !== "SYSTEM" &&
        prevMessage?.senderId === message.senderId;
      const showTime =
        !nextMessage ||
        nextMessage.senderId !== message.senderId ||
        !isSameMinute(message.createdAt, nextMessage.createdAt);
      const showReadDivider =
        frozenLastReadMessageId !== null &&
        prevMessage?.chatMessageId === frozenLastReadMessageId &&
        message.chatMessageId !== frozenLastReadMessageId;
      const unreadCount = Math.max(
        0,
        message.visibleMemberCount - message.readCount
      );

      return {
        ...message,
        showDateDivider,
        isSameSenderAsPrev,
        showTime,
        showReadDivider,
        unreadCount,
      };
    });
    return [...withMeta].reverse();
  }, [allMessages, frozenLastReadMessageId]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage({ messageType: "TEXT", content: draft });
    setDraft("");
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `image-${Date.now()}.jpg`;
    const contentType = asset.mimeType ?? "image/jpeg";

    setIsUploading(true);
    try {
      // useChatImageUpload는 브라우저 File 객체(file.name/file.type)를 기대하는데
      // RN ImagePicker 결과는 File이 아니라서 캐스팅해도 name이 비어 presigned URL
      // 요청에 fileName이 안 실렸었음(이미지가 안 뜨던 원인) -> 공지 작성 화면과
      // 동일하게 presigned URL을 직접 받아서 PUT하는 방식으로 변경.
      const { uploadUrl, imageKey } = await getChatImagePresignedUrl({
        fileName,
        contentType,
      });

      const blob = await (await fetch(asset.uri)).blob();
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      sendMessage({ messageType: "IMAGE", imageKey });
    } catch (err) {
      console.error("이미지 업로드 실패", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollToBottom(e.nativeEvent.contentOffset.y > 200);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = ({ item }: { item: DisplayMessage }) => {
    const isMine = item.senderId === currentUserId;

    return (
      <View>
        {item.showDateDivider && (
          <View className="mt-6 mb-2 items-center justify-center">
            <Text className="overflow-hidden rounded-full bg-[#D6DDE5]/30 px-3 py-1 text-xs font-medium text-[#989898]">
              {formatChatDate(item.createdAt)}
            </Text>
          </View>
        )}

        {item.messageType === "SYSTEM" ? (
          <View className="mt-6 items-center justify-center">
            <Text className="overflow-hidden rounded-full bg-[#ffffff] px-3 py-1.5 text-[11px] font-medium text-[#989898]">
              {item.content}
            </Text>
          </View>
        ) : (
          <>
            {item.showReadDivider && (
              <View className="mt-4 mb-2 flex-row items-center gap-2">
                <View className="h-px flex-1 bg-[#D6DDE5]" />
                <Text className="text-xs font-medium text-[#989898]">
                  여기까지 읽음
                </Text>
                <View className="h-px flex-1 bg-[#D6DDE5]" />
              </View>
            )}

            <View
              className={`flex-row items-end gap-2 ${
                isMine ? "flex-row-reverse" : "flex-row"
              } ${item.isSameSenderAsPrev ? "mt-2" : "mt-4"}`}
            >
              {!isMine && roomType !== "DIRECT" && !item.isSameSenderAsPrev && (
                <View className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D6DDE5]">
                  {item.senderProfileUrl && (
                    <Image
                      source={{ uri: item.senderProfileUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  )}
                </View>
              )}
              {!isMine && roomType !== "DIRECT" && item.isSameSenderAsPrev && (
                <View className="w-8 shrink-0" />
              )}

              <View
                className={`max-w-[70%] ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                {!isMine &&
                  roomType !== "DIRECT" &&
                  !item.isSameSenderAsPrev && (
                    <Text className="mb-1 px-1 text-xs font-medium text-[#989898]">
                      {item.senderName}
                    </Text>
                  )}

                <View className="flex-row items-end gap-1">
                  {isMine && (
                    <View className="mb-0.5 items-end">
                      {item.unreadCount > 0 && (
                        <Text className="text-[10px] font-medium text-[#5E92F0]">
                          {item.unreadCount}
                        </Text>
                      )}
                      {item.showTime && (
                        <Text className="text-[10px] text-[#B0B0B0]">
                          {formatChatMessageTime(item.createdAt)}
                        </Text>
                      )}
                    </View>
                  )}

                  {item.messageType === "IMAGE" && item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{
                        width: 200,
                        aspectRatio: 1,
                        borderRadius: 16,
                      }}
                      resizeMode="cover"
                    />
                  ) : item.content && isEmojiOnlyMessage(item.content) ? (
                    <Text className="px-1 py-1 text-[40px] leading-none">
                      {item.content}
                    </Text>
                  ) : (
                    <View
                      className={`rounded-2xl px-4 py-2 ${
                        isMine
                          ? "rounded-br-sm bg-[#5E92F0]"
                          : "rounded-bl-sm bg-[#ffffff]"
                      }`}
                    >
                      <Text
                        className={`text-[13px] leading-relaxed ${
                          isMine ? "text-white" : "text-[#2C2C2C]"
                        }`}
                      >
                        {item.content}
                      </Text>
                    </View>
                  )}

                  {!isMine && (
                    <View className="mb-0.5 items-start">
                      {item.unreadCount > 0 && (
                        <Text className="text-[10px] font-medium text-[#5E92F0]">
                          {item.unreadCount}
                        </Text>
                      )}
                      {item.showTime && (
                        <Text className="text-[10px] text-[#B0B0B0]">
                          {formatChatMessageTime(item.createdAt)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        style={{ paddingTop: 58 }}
        className="flex-row items-center justify-between  bg-[#F0F2F5] pl-6 pr-4 pb-2"
      >
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
          <ChatRoomAvatar
            imageUrl={roomImageUrl}
            memberProfileUrls={memberProfileUrls}
            roomName={roomName}
            chatRoomType={roomType}
            size={40}
          />
          <Text
            numberOfLines={1}
            className="text-[20px] font-semibold text-[#2C2C2C]"
          >
            {roomName}
          </Text>
        </View>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          className="rounded-full p-2 transition-transform duration-150 ease-out  active:scale-90"
        >
          <Menu size={22} color="#2C2C2C" />
        </Pressable>
      </View>

      <View className="flex-1 bg-[#F0F2F5]">
        {isLoading || !anchor ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#989898" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={(item) => String(item.chatMessageId)}
            renderItem={renderItem}
            inverted
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-3">
                  <ActivityIndicator size="small" color="#9C9C9C" />
                </View>
              ) : null
            }
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              paddingHorizontal: 10,
              paddingVertical: 12,
            }}
          />
        )}

        {showScrollToBottom && (
          <Pressable
            onPress={scrollToBottom}
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: [{ translateX: -18 }],
            }}
            className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs"
          >
            <ChevronDown size={20} strokeWidth={2.5} color="#989898" />
          </Pressable>
        )}
      </View>

      <View
        style={{
          paddingBottom: keyboardVisible ? 16 : insets.bottom + 16,
        }}
        className="flex-row items-center gap-2 bg-[#F6F8FA] px-6 py-4"
      >
        <Pressable onPress={handlePickImage} className="shrink-0 px-2">
          <ImagePlus size={24} color="#5E92F0" />
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#B0B0B0"
          className="flex-1 rounded-full bg-white px-4 h-12 text-[15px]"
        />

        <Pressable
          onPress={handleSend}
          disabled={!draft.trim() || isUploading || !isConnected}
          style={{
            opacity: !draft.trim() || isUploading || !isConnected ? 0.3 : 1,
          }}
          className="px-2"
        >
          <Send size={22} color="#5E92F0" />
        </Pressable>
      </View>
      <ChatRoomDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        roomId={roomId}
        roomType={roomType}
        roomName={roomName}
        roomImageUrl={roomImageUrl}
        onInfoUpdated={(next) => setRoomInfo((prev) => ({ ...prev, ...next }))}
      />
    </KeyboardAvoidingView>
  );
}
