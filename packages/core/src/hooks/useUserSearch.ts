import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@moimi/core/api/user';

export const useUserSearch = (keyword: string) => {
  const trimmed = keyword.trim();

  return useQuery({
    queryKey: ['users', 'search', trimmed],
    queryFn: () => searchUsers(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 1000 * 30,
  });
};
