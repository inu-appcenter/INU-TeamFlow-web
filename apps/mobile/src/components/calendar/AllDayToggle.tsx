import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";

type AllDayToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function AllDayToggle({ checked, onChange }: AllDayToggleProps) {
  const translateX = useRef(new Animated.Value(checked ? 24 : 4)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: checked ? 24 : 4,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [checked]);

  return (
    <View className="mb-3 flex-row items-center gap-2">
      <Text className="text-[14px] font-medium text-[#2C2C2C]">하루종일</Text>
      <Pressable
        onPress={() => onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: checked ? "#5E92F0" : "#D6DDE5",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#fff",
            transform: [{ translateX }],
          }}
        />
      </Pressable>
    </View>
  );
}
