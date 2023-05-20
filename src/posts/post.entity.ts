export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  slug: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
