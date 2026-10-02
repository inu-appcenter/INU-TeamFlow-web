// utils/isEmojiOnly.ts
const EMOJI_REGEX =
  /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200d|\ufe0f|\s)+$/u;

// 이모지만으로 구성된 짧은 메시지인지 판별 (최대 3개까지 허용)
export function isEmojiOnlyMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!EMOJI_REGEX.test(trimmed)) return false;

  // 이모지 개수 세기 (서로게이트 페어 고려)
  const emojiCount = [...trimmed.replace(/\s/g, '')].length;
  return emojiCount > 0 && emojiCount <= 3;
}
