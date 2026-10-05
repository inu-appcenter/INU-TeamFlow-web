import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Skeleton, SkeletonPulse } from "./Skeleton";

interface Props {
  onBack: () => void;
}

function InfoRowSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-center py-3">
      <View style={{ width: 80 }}>
        <Skeleton className="h-4 w-12" />
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}

export function RecruitmentDetailSkeleton({ onBack }: Props) {
  return (
    <View className="flex-1 bg-[#ffffff]">
      {/* 헤더: 카테고리를 아직 몰라서 기본색 */}
      <View
        style={{ backgroundColor: "#E9E9E9", paddingTop: 60 }}
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

          {/* 정보글 바로가기 칩 */}
          <Skeleton className="mt-4 h-[34px] w-44 rounded-xl" />

          {/* 정보 행들 */}
          <View className="mt-6">
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-16" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-7 w-16 rounded-full" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-32" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-10" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <View className="flex-row items-center gap-3">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-7 w-16 rounded-xl" />
              </View>
            </InfoRowSkeleton>
          </View>
        </SkeletonPulse>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <SkeletonPulse>
          {/* 상세요강 */}
          <View className="mt-5">
            <Skeleton className="h-4 w-14" />
            <View className="mt-3 gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </View>
          </View>
        </SkeletonPulse>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <SkeletonPulse>
          {/* 하단 버튼 */}
          <View className="mt-8 items-center">
            <Skeleton className="h-[50px] w-36 rounded-xl" />
          </View>
        </SkeletonPulse>
      </View>
    </View>
  );
}
