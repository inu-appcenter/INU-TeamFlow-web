import { View, Text, Pressable, Linking } from "react-native";
import type {
  PolicyBlock,
  PolicyDocument,
  PolicyListItem,
} from "@moimi/core/types/policy";

interface PolicyContentProps {
  policy: PolicyDocument;
}

export default function PolicyContent({ policy }: PolicyContentProps) {
  return (
    <View>
      {policy.effectiveDate || policy.version ? (
        <View className="mb-4 flex-row flex-wrap gap-x-4">
          {policy.effectiveDate && (
            <Text className="text-[12px] text-[#989898]">
              시행일: {policy.effectiveDate}
            </Text>
          )}
          {policy.version && (
            <Text className="text-[12px] text-[#989898]">
              버전: {policy.version}
            </Text>
          )}
        </View>
      ) : null}

      {policy.intro && policy.intro.length > 0 && (
        <View className="mb-7 gap-3">
          {policy.intro.map((paragraph, i) => (
            <Text key={i} className="text-[14px] leading-6 text-[#6B7684]">
              {paragraph}
            </Text>
          ))}
        </View>
      )}

      <View>
        {policy.sections.map((section, sectionIndex) => (
          <View
            key={section.id}
            className={`py-6 ${
              sectionIndex > 0 ? "border-t-[0.5px] border-[#ECEFF2]" : "pt-0"
            } ${sectionIndex === policy.sections.length - 1 ? "pb-0" : ""}`}
          >
            <Text className="mb-4 text-[15px] font-semibold text-[#2C2C2C]">
              {section.title}
            </Text>

            <View className="gap-4">
              {section.blocks.map((block, index) => (
                <PolicyBlockRenderer
                  key={`${section.id}-${index}`}
                  block={block}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PolicyBlockRenderer({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <Text
          className={`text-[13px] leading-6 ${
            block.emphasis ? "font-semibold text-[#2C2C2C]" : "text-[#6B7684]"
          }`}
        >
          {block.text}
        </Text>
      );

    case "subheading":
      return (
        <Text className="mt-4 text-[14px] font-semibold text-[#2C2C2C]">
          {block.text}
        </Text>
      );

    case "unordered-list":
      return (
        <View className="gap-2 pl-1">
          {block.items.map((item, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="text-[14px] leading-6 text-[#A0A7B2]">•</Text>
              <Text className="flex-1 text-[13px] leading-6 text-[#6B7684]">
                {item}
              </Text>
            </View>
          ))}
        </View>
      );

    case "ordered-list":
      if (block.variant === "cards") {
        return (
          <View className="gap-3">
            {block.items.map((item, index) => (
              <View
                key={index}
                className="rounded-xl border-[0.5px] border-[#ECEFF2] p-4"
              >
                <View className="flex-row gap-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5]">
                    <Text className="text-[12px] font-semibold text-[#6B7684]">
                      {(block.start ?? 1) + index}
                    </Text>
                  </View>

                  <View className="flex-1">
                    {item.title && (
                      <Text className="mb-1.5 text-[14px] font-semibold text-[#2C2C2C]">
                        {item.title}
                      </Text>
                    )}
                    <Text className="text-[14px] leading-6 text-[#6B7684]">
                      {item.text}
                    </Text>
                    {item.children && (
                      <NestedOrderedList items={item.children} />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      }

      return (
        <View className="gap-2.5 pl-1">
          {block.items.map((item, index) => (
            <View key={index} className="flex-row gap-2">
              <Text className="text-[14px] leading-6 text-[#6B7684]">
                {(block.start ?? 1) + index}.
              </Text>
              <View className="flex-1">
                <Text className="text-[14px] leading-6 text-[#6B7684]">
                  {item.title && (
                    <Text className="font-semibold text-[#2C2C2C]">
                      {item.title}{" "}
                    </Text>
                  )}
                  {item.text}
                </Text>
                {item.children && <NestedOrderedList items={item.children} />}
              </View>
            </View>
          ))}
        </View>
      );

    case "card":
      return (
        <View className="rounded-xl bg-[#F6F8FA] p-4">
          {block.title && (
            <Text className="mb-3 text-[14px] font-semibold text-[#2C2C2C]">
              {block.title}
            </Text>
          )}
          <View className="gap-3">
            {block.blocks.map((child, index) => (
              <PolicyBlockRenderer key={index} block={child} />
            ))}
          </View>
        </View>
      );

    case "note":
      return (
        <Text className="text-[12px] leading-5 text-[#989898]">
          {block.text}
        </Text>
      );

    case "key-value":
      return (
        <View className="gap-1">
          {block.items.map((item) => (
            <Text
              key={item.label}
              className="text-[14px] leading-6 text-[#6B7684]"
            >
              <Text className="font-medium text-[#2C2C2C]">{item.label}</Text>
              {": "}
              {item.href ? (
                <Text
                  className="text-[#5E92F0] underline"
                  onPress={() => Linking.openURL(item.href!)}
                >
                  {item.value}
                </Text>
              ) : (
                item.value
              )}
            </Text>
          ))}
        </View>
      );

    default:
      return null;
  }
}

function NestedOrderedList({ items }: { items: PolicyListItem[] }) {
  return (
    <View className="mt-2 gap-2 pl-1">
      {items.map((item, index) => (
        <View key={index} className="flex-row gap-2">
          <Text className="text-[14px] leading-6 text-[#6B7684]">
            {index + 1}.
          </Text>
          <View className="flex-1">
            <Text className="text-[14px] leading-6 text-[#6B7684]">
              {item.title && (
                <Text className="font-semibold text-[#2C2C2C]">
                  {item.title}{" "}
                </Text>
              )}
              {item.text}
            </Text>
            {item.children && <NestedOrderedList items={item.children} />}
          </View>
        </View>
      ))}
    </View>
  );
}
