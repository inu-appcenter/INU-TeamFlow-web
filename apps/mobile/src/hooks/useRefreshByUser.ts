import { useCallback, useState } from "react";

// 당겨서 새로고침용
// React Query의 isRefetching을 그대로 쓰면 포커스 새로고침 때도 스피너가 떠서,
// 사용자가 직접 당겼을 때만 스피너를 보여주도록 상태를 따로 관리
export function useRefreshByUser(refetch: () => Promise<unknown>) {
  const [isRefetchingByUser, setIsRefetchingByUser] = useState(false);

  const refetchByUser = useCallback(async () => {
    setIsRefetchingByUser(true);
    try {
      await refetch();
    } finally {
      setIsRefetchingByUser(false);
    }
  }, [refetch]);

  return { isRefetchingByUser, refetchByUser };
}
