import { createClient } from '@supabase/supabase-js';
import type {
  ForumCategory,
  ForumThread,
  ForumPost,
  CreateThreadData,
  CreatePostData,
  UpdateThreadData,
  UpdatePostData,
} from '../types/forum';

// Initialize Supabase client
// Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============== CATEGORIES ==============

export async function getForumCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getForumCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// ============== THREADS ==============

export async function getThreadsByCategory(
  categoryId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ threads: ForumThread[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get total count
  const { count } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  // Get threads with category info
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      *,
      category:forum_categories(*)
    `)
    .eq('category_id', categoryId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    threads: data || [],
    total: count || 0,
  };
}

export async function getThreadById(threadId: number): Promise<ForumThread | null> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      *,
      category:forum_categories(*)
    `)
    .eq('id', threadId)
    .single();

  if (error) throw error;
  return data;
}

export async function createThread(
  threadData: CreateThreadData,
  userId: string,
  username: string,
  userEmail?: string
): Promise<ForumThread> {
  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      ...threadData,
      user_id: userId,
      username,
      user_email: userEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateThread(
  threadId: number,
  updateData: UpdateThreadData
): Promise<ForumThread> {
  const { data, error } = await supabase
    .from('forum_threads')
    .update(updateData)
    .eq('id', threadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteThread(threadId: number): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId);

  if (error) throw error;
}

export async function incrementThreadViews(threadId: number): Promise<void> {
  const { error } = await supabase.rpc('increment_thread_views', {
    thread_id: threadId,
  });

  if (error) {
    // If RPC doesn't exist, fallback to manual update
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('view_count')
      .eq('id', threadId)
      .single();

    if (thread) {
      await supabase
        .from('forum_threads')
        .update({ view_count: thread.view_count + 1 })
        .eq('id', threadId);
    }
  }
}

// ============== POSTS ==============

export async function getPostsByThread(
  threadId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ posts: ForumPost[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get total count
  const { count } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId);

  // Get posts
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    posts: data || [],
    total: count || 0,
  };
}

export async function createPost(
  postData: CreatePostData,
  userId: string,
  username: string,
  userEmail?: string
): Promise<ForumPost> {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      ...postData,
      user_id: userId,
      username,
      user_email: userEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(
  postId: number,
  updateData: UpdatePostData
): Promise<ForumPost> {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      ...updateData,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(postId: number): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

// ============== USER STATS ==============

export async function getUserThreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function getUserPostCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}