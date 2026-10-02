export const getImageKeyFromUrl = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);

    return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  } catch {
    return null;
  }
};
