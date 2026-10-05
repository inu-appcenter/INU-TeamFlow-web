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

export function InfoPostDetailSkeleton({ onBack }: Props) {
  return (
    <View className="flex-1 bg-white">
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

          {/* 정보 행들: 종류 / 작성자 / 작성일 / 모집글 */}
          <View className="mt-6">
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-16" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-14" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-32" />
            </InfoRowSkeleton>
            <InfoRowSkeleton>
              <Skeleton className="h-4 w-28" />
            </InfoRowSkeleton>
          </View>
        </SkeletonPulse>

        <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

        <SkeletonPulse>
          {/* 본문 */}
          <View className="mt-6 gap-3">
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
