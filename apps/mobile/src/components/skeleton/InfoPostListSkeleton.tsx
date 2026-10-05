import { View } from "react-native";
import { Skeleton, SkeletonPulse } from "./Skeleton";

function InfoPostCardSkeleton() {
  return (
    <View
      style={{ width: "48%" }}
      className="mb-4 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5]/60 bg-white"
    >
      {/* 썸네일 */}
      <View
        style={{ aspectRatio: 4 / 3, backgroundColor: "#E4E7EB" }}
        className="w-full"
      />

      <View className="px-3 py-2.5">
        {/* 카테고리 */}
        <Skeleton className="h-3.5 w-10" />
        {/* 제목 2줄 */}
        <Skeleton className="mt-1.5 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-2/3" />
        {/* 날짜 */}
        <Skeleton className="mt-2 h-3 w-16" />
      </View>
    </View>
  );
}

export function InfoPostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonPulse>
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: count }).map((_, i) => (
          <InfoPostCardSkeleton key={i} />
        ))}
      </View>
    </SkeletonPulse>
  );
}
