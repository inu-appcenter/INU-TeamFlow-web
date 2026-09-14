// components/common/Checkbox.tsx
import { Pressable, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import type { ReactNode } from "react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const BOX_SIZE = { sm: 16, md: 20, lg: 24 };
const ICON_SIZE = { sm: 10, md: 12, lg: 14 };

export default function Checkbox({
  checked,
  onChange,
  label,
  size = "md",
  className = "",
}: CheckboxProps) {
  const box = BOX_SIZE[size];
  const icon = ICON_SIZE[size];

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      className={`flex-row items-center gap-2 ${className}`}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "#D6DDE5",
          backgroundColor: checked ? "#5E92F0" : "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Check size={icon} color="#fff" strokeWidth={3} />}
      </View>

      {typeof label === "string" ? (
        <Text className="text-[14px] text-[#2C2C2C]">{label}</Text>
      ) : (
        label
      )}
    </Pressable>
  );
}
