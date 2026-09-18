// components/SwipeableTabScreen.tsx
import { ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router } from "expo-router";
import { runOnJS } from "react-native-reanimated";

const TAB_ORDER = ["/", "/calendar", "/team", "/chat", "/mypage"] as const;

type TabPath = (typeof TAB_ORDER)[number];

interface SwipeableTabScreenProps {
  currentTab: TabPath;
  children: ReactNode;
}

export default function SwipeableTabScreen({
  currentTab,
  children,
}: SwipeableTabScreenProps) {
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const navigateToIndex = (index: number) => {
    if (index < 0 || index >= TAB_ORDER.length) return;
    router.navigate(TAB_ORDER[index]);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const isSwipe = Math.abs(translationX) > 60 || Math.abs(velocityX) > 500;
      if (!isSwipe) return;

      if (translationX < 0) {
        runOnJS(navigateToIndex)(currentIndex + 1);
      } else {
        runOnJS(navigateToIndex)(currentIndex - 1);
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
}
