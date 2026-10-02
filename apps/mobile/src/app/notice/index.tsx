import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronDown, Mail, Search } from "lucide-react-native";
import { useMyTeamNotices } from "@moimi/core/hooks/useNoticeQuery";
import { categoryColorMap } from "@moimi/core/constants/category";
import { darkenColor } from "@/utils/color/darkenColor";
import { formatDate } from "@/utils/date/formatDate";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import type { TeamNoticeSummary } from "@moimi/core/types/notice";
import { Platform, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";

type SearchType = "title" | "team";

const searchFilter: { value: SearchType; label: string }[] = [
  { value: "title", label: "제목" },
  { value: "team", label: "팀" },
];

function NoticeSearchBar({
  searchType,
  onSearchTypeChange,
  keyword,
  onKeywordChange,
}: {
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const currentLabel = searchFilter.find((f) => f.value === searchType)?.label;

  return (
    <View className="mb-3">
      <View className="h-12 flex-row items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white">
        {Platform.OS === "android" ? (
          <View
            className="h-full border-r-[0.5px] border-[#D6DDE5]/60"
            style={{ width: 100, justifyContent: "center" }}
          >
            <Picker
              selectedValue={searchType}
              onValueChange={(value) => onSearchTypeChange(value as SearchType)}
              mode="dropdown"
              style={{ height: 80 }}
              dropdownIconColor="#2C2C2C"
            >
              {searchFilter.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsFilterOpen(true)}
            style={{ width: 75, justifyContent: "center" }}
            className="h-full flex-row items-center gap-1.5 border-r-[0.5px] border-[#D6DDE5]/60 pl-4 pr-3"
          >
            <Text className="text-[14px] text-[#2C2C2C]">{currentLabel}</Text>
            <ChevronDown size={14} color="#2C2C2C" />
          </Pressable>
        )}

        <View className="flex-1 flex-row items-center gap-2 px-3">
          <Search size={16} color="#B0B0B0" />
          <TextInput
            value={keyword}
            onChangeText={onKeywordChange}
            placeholder="검색어를 입력하세요"
            placeholderTextColor="#B0B0B0"
            className="flex-1 text-[14px] text-[#2C2C2C]"
          />
        </View>
      </View>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={isFilterOpen}
          animationType="slide"
          onRequestClose={() => setIsFilterOpen(false)}
        >
          <Pressable
            onPress={() => setIsFilterOpen(false)}
            className="flex-1 justify-end bg-black/30"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl bg-white pb-8"
            >
              <View className="flex-row justify-end border-b-[0.5px] border-[#D6DDE5] px-4 py-3">
                <Pressable onPress={() => setIsFilterOpen(false)}>
                  <Text className="text-[15px] font-semibold text-[#5E92F0]">
                    완료
                  </Text>
                </Pressable>
              </View>
              <Picker
                selectedValue={searchType}
                onValueChange={(value) =>
                  onSearchTypeChange(value as SearchType)
                }
              >
                {searchFilter.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function NoticeListItem({ notice }: { notice: TeamNoticeSummary }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/notice/[noticeId]",
          params: {
            noticeId: String(notice.noticeId),
            teamId: String(notice.teamId),
          },
        })
      }
      style={{
        borderRadius: 12,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 0.5,
        borderColor: "rgba(214,221,229,0.4)",
        borderLeftWidth: notice.isRead ? 0.5 : 6,
        borderLeftColor: notice.isRead ? "rgba(214,221,229,0.4)" : "#5E92F0",
      }}
      className="active:bg-[#FAFAFA]"
    >
      <View className="flex-row items-center gap-2">
        <Text
          style={{
            backgroundColor: categoryColorMap[notice.teamCategory],
            color: darkenColor(categoryColorMap[notice.teamCategory], 140),
          }}
          className="shrink-0 overflow-hidden rounded-full px-3 py-1 text-xs font-semibold"
        >
          {notice.teamName}
        </Text>

        <View className="flex-1 flex-row items-center gap-1.5">
          <Text
            style={{ flexShrink: 1 }}
            className="text-[16px] font-semibold text-[#2C2C2C]"
            numberOfLines={1}
          >
            {notice.title}
          </Text>

          {!notice.isRead && (
            <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
          )}
        </View>
      </View>

      <Text
        className="mt-2 px-0.5 text-[12px] text-[#989898]"
        numberOfLines={1}
      >
        {notice.authorName} · {getTeamRoleLabel(notice.teamRole)} ·{" "}
        {formatDate(notice.createdAt)}
      </Text>
    </Pressable>
  );
}

export default function NoticeListScreen() {
  const { data: notices = [] } = useMyTeamNotices();
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("title");

  const normalizedKeyword = keyword.replace(/\s/g, "");

  const filtered = notices.filter((notice) => {
    if (!normalizedKeyword) return true;
    const title = notice.title.replace(/\s/g, "");
    const team = notice.teamName.replace(/\s/g, "");
    return searchType === "title"
      ? title.includes(normalizedKeyword)
      : team.includes(normalizedKeyword);
  });

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  );

  const unreadCount = notices.filter((notice) => !notice.isRead).length;

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-16">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">공지</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <NoticeSearchBar
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          keyword={keyword}
          onKeywordChange={setKeyword}
        />

        {unreadCount > 0 && (
          <View className="mb-3 flex-row items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0]/5 px-5 py-4">
            <Mail size={18} strokeWidth={2.5} color="#5E92F0" />
            <Text className="flex-1 text-[14px] font-semibold text-[#2C2C2C]">
              아직 읽지 않은 공지가{" "}
              <Text className="font-bold text-[#5E92F0]">{unreadCount}건</Text>{" "}
              있어요
            </Text>
          </View>
        )}

        <View className="gap-3">
          {sorted.map((notice) => (
            <NoticeListItem key={notice.noticeId} notice={notice} />
          ))}
        </View>

        {sorted.length === 0 && (
          <View className="h-[200px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              공지사항이 없습니다
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
