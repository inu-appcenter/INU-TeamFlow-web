import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAuth } from "@/contexts/AuthContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

// app.json의 imageWidth와 반드시 같은 값 (다르면 네이티브→JS 전환 때 로고가 튐)
const LOGO_WIDTH = 220;
const LOGO_ASPECT = 2500 / 1593;

const CHARACTER_WIDTH = SCREEN_WIDTH * 0.75;
const CHARACTER_ASPECT = 7726 / 8000;
const CHARACTER_HEIGHT = CHARACTER_WIDTH / CHARACTER_ASPECT;

const SPLASH_IMAGE_COUNT = 3;

// ── 스플래시 타이밍 (ms) ──
const CHARACTER_RISE_DELAY = 200; // 화면 전환 후 캐릭터가 출발하기까지
const CHARACTER_RISE_DURATION = 900; // 캐릭터가 올라오는 시간
const WINK_START = 1500; // 윙크로 바뀌는 시점
const WINK_DURATION = 100; // 바뀌는 속도 (0이면 즉시 바뀜)
const FADE_OUT_START = 2900; // 전체 페이드아웃 시작 시점
const FADE_OUT_DURATION = 400;

export function AnimatedSplashOverlay() {
  const { isLoading } = useAuth();
  const [loadedCount, setLoadedCount] = useState(0);
  const [visible, setVisible] = useState(true);

  const characterY = useSharedValue(CHARACTER_HEIGHT); // 화면 아래에 숨겨두고 시작
  const wink = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  const imagesReady = loadedCount >= SPLASH_IMAGE_COUNT;
  const onImageLoad = () => setLoadedCount((n) => n + 1);

  // 이미지 로드 콜백이 안 와도 2초 뒤엔 무조건 진행 (스플래시에서 멈추는 것 방지)
  useEffect(() => {
    const timer = setTimeout(() => setLoadedCount(SPLASH_IMAGE_COUNT), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!imagesReady || isLoading) return;

    SplashScreen.hideAsync().finally(() => {
      // 1) 캐릭터가 천천히, 튕기지 않고 부드럽게 올라옴
      characterY.value = withDelay(
        CHARACTER_RISE_DELAY,
        withTiming(0, {
          duration: CHARACTER_RISE_DURATION,
          easing: Easing.out(Easing.cubic),
        })
      );
      // 2) 다 올라오고 잠깐 쉰 뒤 윙크로 바뀌고 그대로 유지
      wink.value = withDelay(
        WINK_START,
        withTiming(1, { duration: WINK_DURATION })
      );
      // 3) 윙크가 끝나고 잠깐 보여준 뒤 페이드아웃
      overlayOpacity.value = withDelay(
        FADE_OUT_START,
        withTiming(
          0,
          { duration: FADE_OUT_DURATION, easing: Easing.out(Easing.quad) },
          (finished) => {
            if (finished) scheduleOnRN(setVisible, false);
          }
        )
      );
    });
  }, [imagesReady, isLoading]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const characterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: characterY.value }],
  }));

  const winkStyle = useAnimatedStyle(() => ({ opacity: wink.value }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.splashOverlay, overlayStyle]}
    >
      <Image
        style={styles.splashLogo}
        contentFit="contain"
        source={require("@/assets/images/splash-logo.png")}
        onLoad={onImageLoad}
        onError={onImageLoad}
      />

      <Animated.View style={[styles.splashCharacter, characterStyle]}>
        <Image
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          source={require("@/assets/images/splash-character.webp")}
          onLoad={onImageLoad}
          onError={onImageLoad}
        />
        <Animated.View style={[StyleSheet.absoluteFill, winkStyle]}>
          <Image
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            source={require("@/assets/images/splash-character-wink.webp")}
            onLoad={onImageLoad}
            onError={onImageLoad}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F1F7FD",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  splashLogo: {
    width: LOGO_WIDTH,
    aspectRatio: LOGO_ASPECT,
  },
  splashCharacter: {
    position: "absolute",
    bottom: -CHARACTER_HEIGHT * 0.15,
    left: (SCREEN_WIDTH - CHARACTER_WIDTH) / 2,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
  },
});
