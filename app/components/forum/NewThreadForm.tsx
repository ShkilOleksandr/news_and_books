'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewThreadFormProps {
  categoryId: number;
  categorySlug: string;
}

export default function NewThreadForm({ categoryId, categorySlug }: NewThreadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Будь ласка, введіть заголовок / Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Будь ласка, введіть вміст / Please enter content');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Ви маєте увійти, щоб створити тему / You must be logged in to create a thread');
        setIsSubmitting(false);
        return;
      }

      // Get user metadata for username
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          user_id: user.id,
          username,
          user_email: user.email,
          title: title.trim(),
          content: content.trim(),
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Redirect to new thread
      router.push(`/forum/${categorySlug}/${thread.id}`);
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setError(err.message || 'Помилка при створенні теми / Error creating thread');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок теми / Thread Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введіть заголовок... / Enter title..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
          maxLength={200}
        />
        <p className="mt-1 text-sm text-gray-500">
          {title.length}/200 символів / characters
        </p>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Вміст / Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Напишіть повідомлення... / Write your message..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
          disabled={isSubmitting}
        >
          Скасувати / Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? 'Створення... / Creating...' : 'Створити тему / Create Thread'}
        </button>
      </div>
    </form>
  );
}