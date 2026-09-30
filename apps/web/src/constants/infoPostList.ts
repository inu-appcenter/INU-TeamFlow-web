import type { PostListState } from '@/hooks/usePostListState';

export const INFO_POST_ITEMS_PER_PAGE = 20;
export const INFO_POST_PAGE_WINDOW_SIZE = 5;

export const INITIAL_INFO_POST_LIST_STATE: PostListState = {
  page: 1,
  keyword: '',
  queryKeyword: '',
  searchType: 'title',
  selectedCategory: 'ALL',
};

export const INFO_POST_SEARCH_FILTER = [{ value: 'title', label: '제목' }];
