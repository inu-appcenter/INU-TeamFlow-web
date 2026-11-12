import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function SkeletonPulse({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// className에 rounded-* 가 있으면 기본 rounded-md를 붙이지 않음
// (둘 다 있으면 어느 쪽이 적용될지 보장되지 않아 rounded-full이 네모로 보이던 문제)
const HAS_ROUNDED = /(^|\s)rounded(-|\s|$)/;

export function Skeleton({ className = "" }: { className?: string }) {
  const radius = HAS_ROUNDED.test(className) ? "" : "rounded-md";
  return <View className={`${radius} bg-[#E4E7EB] ${className}`} />;
}
