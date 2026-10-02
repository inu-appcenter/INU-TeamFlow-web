const CDN_BASE_URL = 'https://d3dbvb22maaxgy.cloudfront.net/'; // 실제 CDN 도메인으로 확인 필요

export const getImageKeyFromUrl = (imageUrl: string) => {
  if (imageUrl.startsWith(CDN_BASE_URL)) {
    return imageUrl.slice(CDN_BASE_URL.length);
  }
  return imageUrl;
};
