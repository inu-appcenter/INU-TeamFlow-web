import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Skeleton, SkeletonPulse } from "./Skeleton";

interface Props {
  headerColor: string;
  onBack: () => void;
}

export function NoticeDetailSkeleton({ headerColor, onBack }: Props) {
  return (
    <View className="flex-1 bg-[#ffffff]">
      {/* 헤더는 실제로 렌더 (뒤로가기 가능하게) */}
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={onBack}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <SkeletonPulse>
          {/* 제목 */}
          <Skeleton className="h-7 w-3/4" />

          {/* 작성자 · 날짜 */}
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </View>
            <Skeleton className="h-4 w-20" />
          </View>
        </SkeletonPulse>

        {/* 구분선은 실제 그대로 */}
        <View className="mt-2 border-b-[0.5px] border-[#D6DDE5]" />

        <SkeletonPulse>
          {/* 본문 */}
          <View className="mt-4 gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </View>
        </SkeletonPulse>
      </View>
    </View>
  );
}
