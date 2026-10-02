// apps/mobile/src/utils/getImageKey.ts
export function getImageKeyFromUrl(imageUrl: string): string {
  try {
    return decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/+/, ""));
  } catch {
    return imageUrl;
  }
}
