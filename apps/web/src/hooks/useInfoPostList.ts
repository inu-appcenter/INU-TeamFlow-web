"use client";

import { useEffect } from "react";
import { usePostListState } from "@/hooks/usePostListState";
import { useInfoPosts } from "@moimi/core/hooks/useInfoPostQuery";
import type {
  GetInfoPostsParams,
  InfoPostCategory,
} from "@moimi/core/types/infoPost";
import {
  INFO_POST_ITEMS_PER_PAGE,
  INITIAL_INFO_POST_LIST_STATE,
} from "@/constants/infoPostList";

export function useInfoPostList() {
  const [listState, setListState, isRestored] = usePostListState(
    "infoPost:list",
    INITIAL_INFO_POST_LIST_STATE,
  );

  const { page, keyword, queryKeyword, searchType, selectedCategory } =
    listState;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextKeyword = keyword.trim();
      setListState((prev) =>
        prev.queryKeyword === nextKeyword
          ? prev
          : { ...prev, queryKeyword: nextKeyword },
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword, setListState]);

  const queryParams: GetInfoPostsParams = {
    keyword: queryKeyword || undefined,
    category:
      selectedCategory === "ALL"
        ? undefined
        : (selectedCategory as InfoPostCategory),
    page: page - 1,
    size: INFO_POST_ITEMS_PER_PAGE,
    sort: ["createdAt,DESC"],
  };

  const { data, isLoading } = useInfoPosts(queryParams);

  return {
    infoPosts: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isRestored,
    page,
    keyword,
    searchType,
    selectedCategory,
    setPage: (nextPage: number) =>
      setListState((prev) => ({ ...prev, page: nextPage })),
    setKeyword: (value: string) =>
      setListState((prev) => ({ ...prev, keyword: value, page: 1 })),
    setCategory: (category: string) =>
      setListState((prev) => ({
        ...prev,
        selectedCategory: category,
        page: 1,
      })),
    setSearchType: (type: string) =>
      setListState((prev) => ({ ...prev, searchType: type, page: 1 })),
  };
}
