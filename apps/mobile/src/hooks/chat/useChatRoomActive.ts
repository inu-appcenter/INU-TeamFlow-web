import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";

/**
 * 채팅방을 "실제로 보고 있는지"
 * - 화면이 포커스돼 있고 (위에 다른 화면이 쌓이지 않음)
 * - 앱이 백그라운드가 아닐 때
 * 서버는 채팅방 구독 여부로 "보고 있음"을 판단해서 푸시를 생략하므로,
 * 이 값이 false면 구독을 해제해야 푸시가 온다.
 */
export function useChatRoomActive() {
  const [isFocused, setIsFocused] = useState(false);
  const [isForeground, setIsForeground] = useState(
    AppState.currentState !== "background"
  );

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    // inactive(제어 센터, 알림 센터 등)는 잠깐이라 포그라운드로 취급
    const subscription = AppState.addEventListener("change", (status) => {
      setIsForeground(status !== "background");
    });
    return () => subscription.remove();
  }, []);

  return isFocused && isForeground;
}
