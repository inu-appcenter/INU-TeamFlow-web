import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];
import {
  Home,
  CalendarDays,
  Users,
  MessagesSquare,
  CircleUser,
  type LucideIcon,
} from "lucide-react-native";
import { useUnreadChatCount } from "@moimi/core/hooks/chat/useUnreadChatCount";

const TAB_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: "홈", icon: Home },
  calendar: { label: "캘린더", icon: CalendarDays },
  team: { label: "팀", icon: Users },
  chat: { label: "채팅", icon: MessagesSquare },
  mypage: { label: "마이페이지", icon: CircleUser },
};

export const TAB_BAR_HEIGHT = 68;
const SIDE_GAP = 16; // right-4 / left-4
const MIN_BOTTOM_GAP = 24; // bottom-6
const SPRING = {
  stiffness: 500,
  damping: 40,
  mass: 1,
  overshootClamping: true,
};
const DRAG_STRETCH = 0.1; // 드래그 중 인디케이터 가로로 늘어나는 비율

const ACTIVE_COLOR = "rgba(44,44,44,0.9)"; // #2c2c2c/90
const INACTIVE_COLOR = "rgba(162,169,178,0.8)"; // #A2A9B2/80

/** 탭바가 떠 있으니까 각 화면 하단 여백에 이 값을 쓰면 됨 */
export function useTabBarBottomSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, MIN_BOTTOM_GAP) + 16;
}

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const unreadChatCount = useUnreadChatCount();
  const [barWidth, setBarWidth] = useState(0);
  // 드래그 중 손가락이 올라가 있는 탭 (드래그 안 할 때는 null)
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const routes = state.routes.filter((r) => TAB_CONFIG[r.name]);
  const activeName = state.routes[state.index]?.name;
  const activeIndex = routes.findIndex((r) => r.name === activeName);
  const itemWidth = barWidth / routes.length;
  const maxX = Math.max(routes.length - 1, 0) * itemWidth;

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const dragProgress = useSharedValue(0);
  const lastDragIndex = useSharedValue(-1);
  const didInit = useRef(false);

  useEffect(() => {
    if (!itemWidth) return;
    const targetX = Math.max(activeIndex, 0) * itemWidth;
    const targetOpacity = activeIndex === -1 ? 0 : 1;

    // 웹의 initial={false}: 첫 렌더는 애니메이션 없이 바로 위치
    if (!didInit.current) {
      translateX.value = targetX;
      opacity.value = targetOpacity;
      didInit.current = true;
      return;
    }
    translateX.value = withSpring(targetX, SPRING);
    opacity.value = withTiming(targetOpacity, { duration: 150 });
  }, [activeIndex, itemWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: 1 + dragProgress.value * DRAG_STRETCH },
    ],
    opacity: opacity.value,
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setBarWidth(e.nativeEvent.layout.width);

  const navigateTo = (index: number) => {
    const route = routes[index];
    if (!route) return false;

    const isFocused = route.name === activeName;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
      return true;
    }
    return false;
  };

  // 드래그를 놓았을 때: 다른 탭이면 이동, 같은 탭이거나 이동이 막히면 원래 자리로
  const finishDrag = (index: number) => {
    if (routes[index]?.name === activeName) return;
    const moved = navigateTo(index);
    if (!moved && itemWidth) {
      translateX.value = withSpring(
        Math.max(activeIndex, 0) * itemWidth,
        SPRING
      );
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(itemWidth > 0 && activeIndex !== -1)
    // 가로로 10px 이상 밀어야 슬라이드로 인식 → 짧은 탭은 Pressable이 처리
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onStart(() => {
      lastDragIndex.value = -1;
      dragProgress.value = withSpring(1, SPRING);
    })
    .onUpdate((e) => {
      // 손가락 위치가 인디케이터 가운데로 오도록
      const x = Math.min(Math.max(e.x - itemWidth / 2, 0), maxX);
      translateX.value = x;

      const index = Math.round(x / itemWidth);
      if (index !== lastDragIndex.value) {
        lastDragIndex.value = index;
        runOnJS(setDragIndex)(index);
      }
    })
    .onEnd(() => {
      const index = Math.round(translateX.value / itemWidth);
      translateX.value = withSpring(index * itemWidth, SPRING);
      runOnJS(finishDrag)(index);
    })
    .onFinalize(() => {
      dragProgress.value = withSpring(0, SPRING);
      runOnJS(setDragIndex)(null);
    });

  // 드래그 중이면 손가락 아래 탭을, 아니면 현재 탭을 강조
  const highlightIndex = dragIndex ?? activeIndex;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, MIN_BOTTOM_GAP) },
      ]}
    >
      <View style={styles.bar}>
        {/* 배경: iOS는 blur, Android는 반투명 흰색 */}
        {Platform.OS === "ios" ? (
          <>
            <BlurView
              intensity={30}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, styles.glass]} />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
        )}

        <GestureDetector gesture={panGesture}>
          <View style={styles.row} onLayout={onLayout}>
            {itemWidth > 0 && (
              <Animated.View
                pointerEvents="none"
                style={[styles.indicator, { width: itemWidth }, indicatorStyle]}
              />
            )}

            {routes.map((route, index) => {
              const { label, icon: Icon } = TAB_CONFIG[route.name];
              const isFocused = route.name === activeName;
              const color =
                index === highlightIndex ? ACTIVE_COLOR : INACTIVE_COLOR;
              const badgeCount = route.name === "chat" ? unreadChatCount : 0;

              return (
                <Pressable
                  key={route.key}
                  onPress={() => navigateTo(index)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={label}
                  style={styles.item}
                >
                  <View style={styles.iconWrap}>
                    <Icon size={20} strokeWidth={1.8} color={color} />
                    {badgeCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={[styles.label, { color }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: SIDE_GAP,
    right: SIDE_GAP,
    height: TAB_BAR_HEIGHT,
    borderRadius: 999,
    boxShadow: "6px 8px 24px 0px rgba(149,157,165,0.20)",
  },
  bar: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EDF1F5",
    overflow: "hidden",
  },
  glass: { backgroundColor: "rgba(255,255,255,0.6)" },
  androidBg: { backgroundColor: "rgba(255,255,255,0.92)" },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: "rgba(238,241,245,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    boxShadow:
      "inset 1.5px 1.5px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(149,157,165,0.15), inset 0px 0px 8px rgba(255,255,255,0.25), 0px 1px 4px rgba(149,157,165,0.15)",
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  iconWrap: { marginBottom: 2 },
  label: { fontSize: 11, fontWeight: "700" },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#5E92F0",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontWeight: "600", color: "#fff" },
});
