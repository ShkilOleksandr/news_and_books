import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email === 'romanewsukraine@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  return { isAdmin, loading };
}

// Helper functions for admin actions
export async function adminPinThread(threadId: number) {
  const { error } = await supabase.rpc('admin_pin_thread', {
    thread_id_param: threadId,
  });
  if (error) throw error;
}

export async function adminUnpinThread(threadId: number) {
  const { error } = await supabase.rpc('admin_unpin_thread', {
    thread_id_param: threadId,
  });
  if (error) throw error;
}

export async function adminLockThread(threadId: number) {
  const { error } = await supabase.rpc('admin_lock_thread', {
    thread_id_param: threadId,
  });
  if (error) throw error;
}

export async function adminUnlockThread(threadId: number) {
  const { error } = await supabase.rpc('admin_unlock_thread', {
    thread_id_param: threadId,
  });
  if (error) throw error;
}

export async function adminDeleteThread(threadId: number) {
  const { error } = await supabase.rpc('admin_delete_thread', {
    thread_id_param: threadId,
  });
  if (error) throw error;
}

export async function adminDeletePost(postId: number) {
  const { error } = await supabase.rpc('admin_delete_post', {
    post_id_param: postId,
  });
  if (error) throw error;
}