import {
  categoryMap,
  InfoPostCategoryMap,
} from '@moimi/core/constants/category';

type PostType = 'recruitment' | 'info_post';

const allowedCategories = new Set<string>([
  ...Object.keys(categoryMap),
  ...Object.keys(InfoPostCategoryMap),
]);

const postCategories = new Map<string, string>();

export function safeId(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }

  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    return value;
  }

  return undefined;
}

export function safeCategory(value: unknown): string | undefined {
  if (typeof value !== 'string' || !allowedCategories.has(value)) {
    return undefined;
  }

  return value;
}

export function getPostCategory(
  postType: PostType,
  postId: string
): string | undefined {
  return postCategories.get(`${postType}:${postId}`);
}

export function rememberPostContext(
  postType: PostType,
  postId: unknown,
  category: unknown
): void {
  const id = safeId(postId);
  const validCategory = safeCategory(category);

  if (!id || !validCategory) return;

  postCategories.set(`${postType}:${id}`, validCategory);
}

export function rememberResponse(data: unknown): void {
  if (Array.isArray(data)) {
    data.forEach(rememberResponse);
    return;
  }

  if (!data || typeof data !== 'object') {
    return;
  }

  const row = data as Record<string, unknown>;
  const category = safeCategory(row.category);

  if (category) {
    const recruitmentId = safeId(row.recruitmentId);
    const infoPostId = safeId(row.infoPostId);

    if (recruitmentId) {
      rememberPostContext('recruitment', recruitmentId, category);
    } else if (infoPostId) {
      rememberPostContext('info_post', infoPostId, category);
    }
  }

  // 페이지네이션 응답의 게시물 목록
  if (Array.isArray(row.content)) {
    row.content.forEach(rememberResponse);
  }
}

export function clearAnalyticsContextCache(): void {
  postCategories.clear();
}

export function getCreatedPostId(
  postType: PostType,
  data: unknown
): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return undefined;
  }

  const row = data as Record<string, unknown>;

  return safeId(
    row[postType === 'recruitment' ? 'recruitmentId' : 'infoPostId']
  );
}
