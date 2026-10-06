import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAuth } from "@/contexts/AuthContext";

const INITIAL_SCALE_FACTOR = Dimensions.get("screen").height / 90;
const DURATION = 600;

// 배경: 로고가 커지기 시작할 때쯤부터 페이드아웃
const splashKeyframe = new Keyframe({
  0: {
    opacity: 1,
  },
  40: {
    opacity: 1,
  },
  100: {
    opacity: 0,
    easing: Easing.out(Easing.quad),
  },
});

// 로고: 살짝 눌렸다가 → 커지면서 사라짐
const splashLogoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  25: {
    transform: [{ scale: 0.88 }],
    opacity: 1,
    easing: Easing.out(Easing.quad),
  },
  100: {
    transform: [{ scale: 1.4 }],
    opacity: 0,
    easing: Easing.in(Easing.cubic),
  },
});

export function AnimatedSplashOverlay() {
  const { isLoading } = useAuth();
  const [layoutReady, setLayoutReady] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (layoutReady && !isLoading) {
      SplashScreen.hideAsync().finally(() => {
        setAnimate(true);
      });
    }
  }, [layoutReady, isLoading]);

  if (!visible) return null;

  const image = (
    <Image
      style={styles.splashImage}
      contentFit="contain"
      source={require("@/assets/images/logo.png")}
    />
  );

  return animate ? (
    <Animated.View
      pointerEvents="none"
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}
    >
      <Animated.View entering={splashLogoKeyframe.duration(DURATION)}>
        {image}
      </Animated.View>
    </Animated.View>
  ) : (
    <View onLayout={() => setLayoutReady(true)} style={styles.splashOverlay}>
      {image}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: "0deg" }],
  },
  100: {
    transform: [{ rotateZ: "7200deg" }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        entering={glowKeyframe.duration(60 * 1000 * 4)}
        style={styles.glow}
      >
        <Image
          style={styles.glow}
          source={require("@/assets/images/logo-glow.png")}
        />
      </Animated.View>

      <Animated.View
        entering={keyframe.duration(DURATION)}
        style={styles.background}
      />
      <Animated.View
        style={styles.imageContainer}
        entering={logoKeyframe.duration(DURATION)}
      >
        <Image
          style={styles.image}
          source={require("@/assets/images/expo-logo.png")}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: 201,
    height: 201,
    position: "absolute",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 120,
    height: 120,
  },
  splashImage: {
    width: 200,
    height: 200,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: "absolute",
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F1F7FD",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
