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
    addReply: 'Додати відповідь',
    replyPlaceholder: 'Напишіть вашу відповідь...',
    cancel: 'Скасувати',
    reply: 'Відповісти',
    posting: 'Публікація...',
    errorContent: 'Будь ласка, введіть відповідь',
    errorAuth: 'Ви повинні увійти, щоб відповісти',
    errorPosting: 'Помилка при публікації відповіді'
  },
  en: {
    addReply: 'Add Reply',
    replyPlaceholder: 'Write your reply...',
    cancel: 'Cancel',
    reply: 'Reply',
    posting: 'Posting...',
    errorContent: 'Please enter a reply',
    errorAuth: 'You must be logged in to reply',
    errorPosting: 'Error posting reply'
  }
};

interface ReplyFormProps {
  threadId: number;
  categorySlug: string;
}

export default function ReplyForm({ threadId, categorySlug }: ReplyFormProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const t = translations[lang];

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
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

      // Create post
      const { error: insertError } = await supabase
        .from('forum_posts')
        .insert([{
          thread_id: threadId,
          user_id: user.id,
          username: username,
          user_email: user.email || '',
          content: content.trim(),
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`${t.errorPosting}: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Clear form immediately for better UX
      setContent('');
      setIsSubmitting(false);

      // Force a hard refresh to show new reply
      window.location.reload();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(`${t.errorPosting}: ${err.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setContent('');
    setError('');
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
      <h3 className="text-2xl font-bold mb-6">{t.addReply}</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content Field */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.replyPlaceholder}
            disabled={isSubmitting}
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed resize-y transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.posting : t.reply}
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