import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get all forum categories
export async function getForumCategories() {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get category by slug
export async function getForumCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// Get threads by category with pagination
export async function getThreadsByCategory(categoryId: number, page: number = 1) {
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Get total count
  const { count } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  // Get threads
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('category_id', categoryId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    threads: data || [],
    total: count || 0,
  };
}

// Get thread by ID with category info
export async function getThreadById(threadId: number) {
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

// Create a new thread (BILINGUAL VERSION)
export async function createThread(threadData: {
  category_id: number;
  user_id: string;
  username: string;
  user_email: string;
  title_uk: string;
  title_en: string;
  content_uk: string;
  content_en: string;
}) {
  const { data, error } = await supabase
    .from('forum_threads')
    .insert([threadData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a thread
export async function updateThread(threadId: number, updates: {
  title_uk?: string;
  title_en?: string;
  content_uk?: string;
  content_en?: string;
}) {
  const { data, error } = await supabase
    .from('forum_threads')
    .update(updates)
    .eq('id', threadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a thread
export async function deleteThread(threadId: number) {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId);

  if (error) throw error;
}

// Increment thread view count
export async function incrementThreadViews(threadId: number) {
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

// Get posts by thread with pagination
export async function getPostsByThread(threadId: number, page: number = 1) {
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

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

// Create a new post (BILINGUAL VERSION)
export async function createPost(postData: {
  thread_id: number;
  user_id: string;
  username: string;
  user_email: string;
  content_uk: string;
  content_en: string;
}) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a post
export async function updatePost(postId: number, updates: {
  content_uk?: string;
  content_en?: string;
}) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      ...updates,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a post
export async function deletePost(postId: number) {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

// Get user's thread count
export async function getUserThreadCount(userId: string) {
  const { count, error } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

// Get user's post count
export async function getUserPostCount(userId: string) {
  const { count, error } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}