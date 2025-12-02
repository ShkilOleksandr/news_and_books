'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const translations = {
  uk: {
    threadTitle: 'Заголовок теми',
    titlePlaceholder: 'Введіть заголовок вашої теми...',
    content: 'Зміст',
    contentPlaceholder: 'Напишіть зміст вашої теми...',
    required: "Обов'язкове поле",
    characters: 'символів',
    cancel: 'Скасувати',
    createThread: 'Створити тему',
    creating: 'Створення...',
    errorTitle: 'Будь ласка, введіть заголовок',
    errorContent: 'Будь ласка, введіть зміст',
    errorAuth: 'Ви повинні увійти, щоб створити тему',
    errorCreating: 'Помилка при створенні теми'
  },
  en: {
    threadTitle: 'Thread Title',
    titlePlaceholder: 'Enter your thread title...',
    content: 'Content',
    contentPlaceholder: 'Write your thread content...',
    required: 'Required',
    characters: 'characters',
    cancel: 'Cancel',
    createThread: 'Create Thread',
    creating: 'Creating...',
    errorTitle: 'Please enter a title',
    errorContent: 'Please enter content',
    errorAuth: 'You must be logged in to create a thread',
    errorCreating: 'Error creating thread'
  }
};

interface NewThreadFormProps {
  categoryId: number;
  categorySlug: string;
}

export default function NewThreadForm({ categoryId, categorySlug }: NewThreadFormProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxTitleLength = 200;
  const titleCharsLeft = maxTitleLength - title.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError(t.errorTitle);
      return;
    }

    if (!content.trim()) {
      setError(t.errorContent);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(t.errorAuth);
        setIsSubmitting(false);
        return;
      }

      // Get username from user metadata or email
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

      // Create thread
      const { data: newThread, error: insertError } = await supabase
        .from('forum_threads')
        .insert([{
          category_id: categoryId,
          user_id: user.id,
          username: username,
          user_email: user.email || '',
          title: title.trim(),
          content: content.trim(),
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`${t.errorCreating}: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Redirect to the new thread
      router.push(`/forum/${categorySlug}/${newThread.id}`);
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setError(`${t.errorCreating}: ${err.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push(`/forum/${categorySlug}`);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Title Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-lg font-semibold text-white">
              {t.threadTitle} <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-sm ${
                titleCharsLeft < 20 ? 'text-yellow-500' : 'text-gray-500'
              }`}
            >
              {titleCharsLeft} {t.characters}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
            placeholder={t.titlePlaceholder}
            disabled={isSubmitting}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        {/* Content Field */}
        <div>
          <label className="block text-lg font-semibold text-white mb-2">
            {t.content} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.contentPlaceholder}
            disabled={isSubmitting}
            rows={12}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed resize-y transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.creating : t.createThread}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}