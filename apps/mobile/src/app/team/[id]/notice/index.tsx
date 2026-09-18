import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Pin,
  Plus,
  Search,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";

import { useMyTeamNotices } from "@moimi/core/hooks/useNoticeQuery";
import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import { formatDate } from "@/utils/date/formatDate";
import { getTeamRoleLabel } from "@/utils/user/teamRole";

const categoryColorMap: Record<string, string> = {
  CONTEST: "#FBE4F8",
  STUDY: "#D8FAD8",
  PROJECT: "#DCEBFF",
  CLUB: "#FFF1CC",
  ETC: "#E9E9E9",
};

const categoryMap: Record<string, string> = {
  CONTEST: "공모전",
  STUDY: "스터디",
  PROJECT: "프로젝트",
  CLUB: "동아리",
  ETC: "기타",
};

const ITEMS_PER_PAGE = 8;
type SearchType = "title" | "author";

const searchFilter: { value: SearchType; label: string }[] = [
  { value: "title", label: "제목" },
  { value: "author", label: "작성자" },
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
    <View>
      <View className="h-12 flex-row items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA]">
        {Platform.OS === "android" ? (
          <View
            className="h-full border-r-[0.5px] border-[#D6DDE5]/60"
            style={{ width: 100, justifyContent: "center" }}
          >
            <Picker
              selectedValue={searchType}
              onValueChange={(value) => onSearchTypeChange(value as SearchType)}
              mode="dropdown"
              style={{ height: 40 }}
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

export default function TeamNoticeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team } = useTeamDetail(teamId);
  const isAdmin = team?.role === "LEADER" || team?.role === "MANAGER";

  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [page, setPage] = useState(1);

  const normalizedKeyword = keyword.replace(/\s/g, "");

  const { data: notices = [] } = useMyTeamNotices();

  const teamNotices = notices.filter((notice) => notice.teamId === teamId);

  const filtered = teamNotices.filter((notice) => {
    const title = notice.title.replace(/\s/g, "");
    const author = notice.authorName.replace(/\s/g, "");

    if (searchType === "title") return title.includes(normalizedKeyword);
    if (searchType === "author") return author.includes(normalizedKeyword);

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const unreadCount = teamNotices.filter((notice) => !notice.isRead).length;

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleSearchTypeChange = (value: SearchType) => {
    setSearchType(value);
    setPage(1);
  };

  const category = team?.category ?? "ETC";

  return (
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <View
        style={{
          paddingTop: 60,
          backgroundColor: categoryColorMap[category],
        }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.push(`/team/${teamId}`)}
            hitSlop={10}
          >
            <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
          <Text className="text-[20px] font-bold text-[#2C2C2C]">
            팀 공지사항
          </Text>
        </View>

        <View className="rounded-full bg-white/80 px-5 py-2">
          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
            {categoryMap[category]}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
      >
        {/* 검색 */}
        <View className="mb-4 flex-row items-center gap-3">
          <View className="flex-1">
            <NoticeSearchBar
              searchType={searchType}
              onSearchTypeChange={handleSearchTypeChange}
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
            />
          </View>

          {isAdmin && (
            <Pressable
              onPress={() => router.push(`/team/${teamId}/notice/write`)}
              className="h-12 w-12 items-center justify-center rounded-full bg-[#5E92F0] transition-transform duration-150 ease-out active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* 미확인 공지 배너 */}
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

        {/* 목록 */}
        <View className="gap-3">
          {paged.map((notice) => (
            <Pressable
              key={notice.noticeId}
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
                backgroundColor: "#F6F8FA",
                paddingHorizontal: notice.isRead ? 16 : 14,
                paddingVertical: 16,
                borderWidth: 0.5,
                borderColor: "rgba(214,221,229,0.4)",
                borderLeftWidth: notice.isRead ? 0.5 : 6,
                borderLeftColor: notice.isRead
                  ? "rgba(214,221,229,0.4)"
                  : "#5E92F0",
              }}
              className="active:bg-[#FAFAFA]"
            >
              <View className="flex-1 flex-row items-center gap-2">
                {notice.isPinned && (
                  <Pin size={16} strokeWidth={2.5} color="#5E92F0" />
                )}
                <Text
                  style={{ flexShrink: 1 }}
                  numberOfLines={1}
                  className="text-[16px] font-semibold text-[#2C2C2C]"
                >
                  {notice.title}
                </Text>
                {!notice.isRead && (
                  <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
                )}
              </View>

              <Text
                numberOfLines={1}
                className="mt-2 text-[12px] text-[#989898]"
              >
                {notice.authorName} · {getTeamRoleLabel(notice.teamRole)} ·{" "}
                {formatDate(notice.createdAt)}
              </Text>
            </Pressable>
          ))}

          {paged.length === 0 && (
            <View className="h-[200px] items-center justify-center rounded-xl bg-white">
              <Text className="text-[13px] text-[#989898]">
                아직 등록된 공지사항이 없어요
              </Text>
            </View>
          )}
        </View>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <View className="mb-8 mt-6 flex-row items-center justify-center gap-2">
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              hitSlop={8}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronLeft size={22} strokeWidth={2.5} color="#2c2c2c66" />
            </Pressable>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => setPage(n)}
                hitSlop={6}
                className="items-center justify-center px-1 transition-transform duration-150 ease-out active:scale-90"
              >
                <Text
                  className={`text-[16px] font-semibold ${
                    currentPage === n ? "text-[#5E92F0]" : "text-[#2c2c2c80]"
                  }`}
                >
                  {n}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              hitSlop={8}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronRight size={22} strokeWidth={2.5} color="#2c2c2c66" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
