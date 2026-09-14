// components/calendar/ColorPicker.tsx
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  SCHEDULE_COLORS,
  EVENT_COLOR_MAP,
  type ScheduleColor,
} from "@moimi/core/constants/scheduleColor";

interface ColorPickerProps {
  value: ScheduleColor;
  onChange: (color: ScheduleColor) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ position: "relative" }}>
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        className="h-[55px] w-[100px] flex-row items-center justify-center gap-2 rounded-2xl bg-[#F6F8FA] active:scale-95"
      >
        <View
          style={{ backgroundColor: EVENT_COLOR_MAP[value] }}
          className="h-6 w-6 rounded-full"
        />
        <Text className="text-[16px] font-semibold text-[#2C2C2C]">색</Text>
      </Pressable>

      {isOpen && (
        <>
          <Pressable
            onPress={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: -1000,
              bottom: -1000,
              left: -1000,
              right: -1000,
              zIndex: 20,
            }}
          />
          <View
            style={{ position: "absolute", top: 62, right: 0, zIndex: 30 }}
            className="w-[100px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2"
          >
            {SCHEDULE_COLORS.map((color) => {
              const isSelected = value === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className={`h-11 w-full items-center justify-center rounded-xl px-3 ${
                    isSelected ? "bg-[#F6F8FA]" : ""
                  }`}
                >
                  <View
                    style={{ backgroundColor: EVENT_COLOR_MAP[color] }}
                    className="h-8 w-full rounded-full"
                  />
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
