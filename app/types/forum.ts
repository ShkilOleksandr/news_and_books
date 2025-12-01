export interface ForumCategory {
  id: number;
  name_uk: string;
  name_en: string;
  description_uk?: string;
  description_en?: string;
  slug: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: number;
  category_id: number;
  user_id: string;
  username: string;
  user_email?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  category?: ForumCategory;
  latest_post?: ForumPost;
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: string;
  username: string;
  user_email?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateThreadData {
  category_id: number;
  title: string;
  content: string;
}

export interface CreatePostData {
  thread_id: number;
  content: string;
}

export interface UpdateThreadData {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
}

export interface UpdatePostData {
  content: string;
}
