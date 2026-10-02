'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

export type PostListState = {
  page: number;
  keyword: string;
  queryKeyword: string;
  searchType: string;
  selectedCategory: string;
};

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function usePostListState(key: string, initial: PostListState) {
  const isRestored = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [state, setState] = useState<PostListState>(() => {
    if (typeof window === 'undefined') return initial;

    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return initial;

      const saved = JSON.parse(raw) as PostListState;
      const stringFields = [
        'keyword',
        'queryKeyword',
        'searchType',
        'selectedCategory',
      ] as const;

      if (
        !Number.isInteger(saved?.page) ||
        saved.page < 1 ||
        !stringFields.every((field) => typeof saved[field] === 'string')
      ) {
        return initial;
      }

      return saved;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (!isRestored) return;

    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state, isRestored]);

  return [isRestored ? state : initial, setState, isRestored] as const;
}
