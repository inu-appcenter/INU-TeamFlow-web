import { useState } from "react";
import { Modal, View, Text, Pressable, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
}

export default function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <>
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={`h-[50px] w-full flex-row items-center justify-between rounded-full px-5 ${
          disabled ? "bg-[#F6F8FA]" : "bg-[#F6F8FA]"
        }`}
      >
        <Text
          className={`text-[15px] ${
            selectedLabel
              ? "text-[#2C2C2C]"
              : disabled
              ? "text-[#B0B8C1]"
              : "text-[#989898]"
          }`}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#989898" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="max-h-[60%] rounded-t-3xl bg-white pb-6 pt-2"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-2 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-[#D6DDE5]" />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className="px-6 py-4"
                >
                  <Text
                    className={`text-[16px] ${
                      item.value === value
                        ? "font-semibold text-[#5E92F0]"
                        : "text-[#2C2C2C]"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
