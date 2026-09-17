// apps/mobile/src/components/ChatRoomAvatar.tsx
import { View, Text, Image } from "react-native";

type ChatRoomType = "TEAM" | "GROUP" | "DIRECT";

type ChatRoomAvatarProps = {
  imageUrl?: string | null;
  memberProfileUrls?: string[] | null;
  roomName: string;
  chatRoomType: ChatRoomType;
  size?: number; // 기본 48 (웹의 h-12/w-12 대응)
};

export default function ChatRoomAvatar({
  imageUrl,
  memberProfileUrls,
  roomName,
  chatRoomType,
  size = 48,
}: ChatRoomAvatarProps) {
  const isRound = chatRoomType === "DIRECT";
  const shapeStyle = {
    width: size,
    height: size,
    borderRadius: isRound ? size / 2 : size * 0.28, // rounded-full vs rounded-xl 대응
    overflow: "hidden" as const,
    backgroundColor: "#EDF1F5",
  };

  // 1) 단일 이미지
  if (imageUrl) {
    return (
      <View style={shapeStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // 2) 멤버 프로필 콜라주 (4명 이상일 때만, 3명 이하는 이니셜로 폴백)
  if (memberProfileUrls && memberProfileUrls.length > 0) {
    const urls = memberProfileUrls.filter((url): url is string => !!url);

    if (urls.length >= 4) {
      const tiles = urls.slice(0, 4);
      return (
        <View style={[shapeStyle, { flexDirection: "row", flexWrap: "wrap" }]}>
          {tiles.map((url, i) => (
            <View key={i} style={{ width: "50%", height: "50%" }}>
              <Image
                source={{ uri: url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      );
    }
  }

  // 3) 이니셜 폴백
  return (
    <View
      style={[
        shapeStyle,
        {
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D6DDE5",
        },
      ]}
    >
      <Text
        style={{ color: "#3F4852", fontWeight: "700", fontSize: size * 0.4 }}
      >
        {roomName?.charAt(0) ?? "?"}
      </Text>
    </View>
  );
}
