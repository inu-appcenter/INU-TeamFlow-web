export type PostType = 'recruitment' | 'info_post';

export interface PostViewOptions {
  postType: PostType;
  postId: number | string | null | undefined;
  category: string | null | undefined;
  enabled?: boolean;
}
