import { View } from "react-native";
import { Skeleton, SkeletonPulse } from "./Skeleton";

function RecruitmentCardSkeleton() {
  return (
    <View
      style={{ borderLeftWidth: 12, borderLeftColor: "#E4E7EB" }}
      className="mb-3 rounded-2xl bg-white p-5"
    >
      {/* 카테고리 칩 + 제목 */}
      <View className="flex-row items-center gap-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
      </View>

      {/* 연결된 정보글 */}
      <Skeleton className="mt-2 h-4 w-1/2" />

      {/* 기간 + 상태 칩 */}
      <View className="mt-5 flex-row items-center justify-between">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </View>
    </View>
  );
}

export function RecruitmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <SkeletonPulse>
      {Array.from({ length: count }).map((_, i) => (
        <RecruitmentCardSkeleton key={i} />
      ))}
    </SkeletonPulse>
  );
}
