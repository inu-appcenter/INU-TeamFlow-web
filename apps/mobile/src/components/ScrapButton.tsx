import { useState } from "react";
import { Pressable } from "react-native";
import axios from "axios";
import { Bookmark } from "lucide-react-native";
import { scrap, unscrap, type ScrapType } from "@moimi/core/api/scrap";

interface ScrapButtonProps {
  type: ScrapType;
  id: number;
  initialScrapped: boolean;
}

export default function ScrapButton({
  type,
  id,
  initialScrapped,
}: ScrapButtonProps) {
  const [isScrapped, setIsScrapped] = useState(initialScrapped);
  const [isPending, setIsPending] = useState(false);

  const handleScrap = async () => {
    if (isPending) return;

    const nextScrapped = !isScrapped;
    setIsPending(true);

    try {
      if (isScrapped) {
        await unscrap(type, id);
      } else {
        await scrap(type, id);
      }
      setIsScrapped(nextScrapped);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsScrapped(nextScrapped);
        return;
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Pressable
      onPress={handleScrap}
      disabled={isPending}
      className="active:scale-90"
    >
      <Bookmark
        size={20}
        strokeWidth={2}
        color={isScrapped ? "#5E92F0" : "#2C2C2C"}
        fill={isScrapped ? "#5E92F0" : "none"}
      />
    </Pressable>
  );
}
