import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Skeleton, SkeletonPulse } from "./Skeleton";

const days = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 섹션 내부 목록 (팀 상세 화면에서도 단독 사용) ---------- */

export function VoteListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="border-b-[0.5px] border-[#D6DDE5] py-4">
          <SkeletonPulse>
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </View>
            <Skeleton className="mt-1.5 h-4 w-1/2" />
          </SkeletonPulse>
        </View>
      ))}
    </>
  );
}

export function NoticeListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="border-b-[0.5px] border-[#D6DDE5] py-4">
          <SkeletonPulse>
            <Skeleton className="h-5 w-2/3" />
            <View className="mt-1.5 flex-row items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </View>
          </SkeletonPulse>
        </View>
      ))}
    </>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-4 rounded-2xl bg-[#F8F9FB] px-4 pb-4 pt-5">
      <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-3">
        <Text className="text-[17px] font-bold text-[#2C2C2C]">{title}</Text>
        <ChevronRight size={20} strokeWidth={2.5} color="#2C2C2C" />
      </View>
      {children}
    </View>
  );
}

/* ---------- 전체 화면 ---------- */

export function TeamDetailSkeleton({ onBack }: { onBack: () => void }) {
  const month = new Date().getMonth() + 1;

  return (
    <View className="flex-1 bg-[#ffffff]">
      {/* 헤더: 카테고리를 아직 몰라서 기본색 */}
      <View
        style={{ paddingTop: 60, backgroundColor: "#E9E9E9" }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <Pressable onPress={onBack} hitSlop={10}>
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <View className="h-[30px] w-20 rounded-full bg-white/80" />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        {/* 팀 프로필 */}
        <SkeletonPulse>
          <View className="flex-row items-start gap-4">
            <Skeleton className="h-[120px] w-[120px] rounded-2xl" />
            <View className="flex-1 justify-center">
              <View className="flex-row items-center justify-between">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </View>
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-2/3" />
            </View>
          </View>
        </SkeletonPulse>

        {/* 캘린더 */}
        <View className="mt-6 rounded-2xl bg-[#F8F9FB] px-4 pb-2.5 pt-2">
          <View className="mb-1 flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] py-2">
            <Text className="text-[18px] font-bold text-[#2C2C2C]"></Text>
            <View className="flex-row gap-3">
              <View className="h-8 w-8 rounded-full bg-[#EEF1F4]" />
              <View className="h-8 w-8 rounded-full bg-[#EEF1F4]" />
            </View>
          </View>

          <View className="flex-row pb-1 pt-1.5">
            {days.map((day) => (
              <Text
                key={day}
                className="text-center text-[12px] text-[#DEDEDE]"
                style={{ width: `${100 / 7}%` }}
              >
                {day}
              </Text>
            ))}
          </View>

          <SkeletonPulse>
            {Array.from({ length: 5 }).map((_, row) => (
              <View key={row} className="flex-row" style={{ height: 86 }}>
                {Array.from({ length: 7 }).map((_, col) => (
                  <View
                    key={col}
                    className="items-center pt-1.5"
                    style={{ width: `${100 / 7}%` }}
                  >
                    <Skeleton className="h-3 w-4" />
                  </View>
                ))}
              </View>
            ))}
          </SkeletonPulse>
        </View>

        <SectionCard title="투표">
          <VoteListSkeleton />
        </SectionCard>
      </View>
    </View>
  );
}
