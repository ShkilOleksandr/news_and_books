'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ReplyFormProps {
  threadId: number;
  categorySlug: string;
}

export default function ReplyForm({ threadId, categorySlug }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Будь ласка, введіть відповідь / Please enter a reply');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Ви маєте увійти, щоб відповісти / You must be logged in to reply');
        setIsSubmitting(false);
        return;
      }

      // Get user metadata for username
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

      // Create post
      const { error: postError } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          user_id: user.id,
          username,
          user_email: user.email,
          content: content.trim(),
        });

      if (postError) throw postError;

      // Reset form and refresh
      setContent('');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Помилка при створенні відповіді / Error creating reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">
        Додати відповідь / Add Reply
      </h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Напишіть вашу відповідь... / Write your reply..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />

        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setContent('')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Скасувати / Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Надсилання... / Posting...' : 'Відповісти / Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}