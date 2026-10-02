import { useEffect } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { X } from "lucide-react-native";

type ImagePreviewModalProps = {
  imageUrl: string | null;
  onClose: () => void;
};

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

export default function ImagePreviewModal({
  imageUrl,
  onClose,
}: ImagePreviewModalProps) {
  const { width, height } = useWindowDimensions();
  const imageWidth = width;
  const imageHeight = height * 0.8;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 다른 이미지를 열 때마다 확대/이동 상태 초기화
  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [imageUrl]);

  // 확대 배율에 맞춰 이미지가 화면 밖으로 너무 나가지 않게 이동 범위 제한
  const clampTranslate = (value: number, size: number, s: number) => {
    "worklet";
    const max = Math.max(0, (size * (s - 1)) / 2);
    return Math.min(Math.max(value, -max), max);
  };

  const resetTransform = () => {
    "worklet";
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // 두 손가락 확대/축소
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(
        Math.max(savedScale.value * e.scale, 0.8),
        MAX_SCALE + 0.5
      );
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetTransform();
        return;
      }
      const nextScale = Math.min(scale.value, MAX_SCALE);
      const nextX = clampTranslate(translateX.value, imageWidth, nextScale);
      const nextY = clampTranslate(translateY.value, imageHeight, nextScale);

      scale.value = withTiming(nextScale);
      translateX.value = withTiming(nextX);
      translateY.value = withTiming(nextY);
      savedScale.value = nextScale;
      savedTranslateX.value = nextX;
      savedTranslateY.value = nextY;
    });

  // 확대 상태에서만 드래그로 이동
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (savedScale.value <= 1) return;
      translateX.value = clampTranslate(
        savedTranslateX.value + e.translationX,
        imageWidth,
        scale.value
      );
      translateY.value = clampTranslate(
        savedTranslateY.value + e.translationY,
        imageHeight,
        scale.value
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // 두 번 탭: 확대 ↔ 원래 크기
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        resetTransform();
        return;
      }
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      savedScale.value = DOUBLE_TAP_SCALE;
    });

  // 한 번 탭: 확대 안 된 상태에서만 닫기
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (savedScale.value <= 1) runOnJS(onClose)();
    });

  const gesture = Gesture.Simultaneous(
    pinch,
    pan,
    Gesture.Exclusive(doubleTap, singleTap)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      transparent
      visible={!!imageUrl}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Android: Modal 안에서 제스처가 동작하려면 RootView로 한 번 더 감싸야 함 */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black/90">
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imageUrl && (
                <Animated.Image
                  source={{ uri: imageUrl }}
                  style={[
                    { width: imageWidth, height: imageHeight },
                    animatedStyle,
                  ]}
                  resizeMode="contain"
                />
              )}
            </Animated.View>
          </GestureDetector>

          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={{ position: "absolute", top: 50, right: 20 }}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <X size={22} color="#fff" />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}