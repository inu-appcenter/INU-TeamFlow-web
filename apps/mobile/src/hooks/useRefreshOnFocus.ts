import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";

/**
 * 화면에 다시 들어올 때(탭 이동, 뒤로가기) refetch
 * 처음 마운트될 때는 useQuery가 알아서 불러오므로 건너뜀
 */
export function useRefreshOnFocus(refetch: () => unknown) {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );
}
