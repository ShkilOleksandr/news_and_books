'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getForumCategoryBySlug, getThreadsByCategory } from '@/app/lib/forum';
import type { ForumCategory, ForumThread } from '@/app/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

const translations = {
  uk: {
    backToForum: 'Назад до форуму',
    newThread: 'Нова тема',
    noThreads: 'Тем ще немає. Будьте першим!',
    loading: 'Завантаження...',
    locked: 'Закрито',
    by: 'від',
    views: 'переглядів',
    replies: 'відповідей',
    previous: 'Попередня',
    next: 'Наступна'
  },
  en: {
    backToForum: 'Back to Forum',
    newThread: 'New Thread',
    noThreads: 'No threads yet. Be the first!',
    loading: 'Loading...',
    locked: 'Locked',
    by: 'by',
    views: 'views',
    replies: 'replies',
    previous: 'Previous',
    next: 'Next'
  }
};

export default function CategoryPage() {
  const { lang } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const page = Number(searchParams.get('page')) || 1;

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    async function loadData() {
      try {
        const categoryData = await getForumCategoryBySlug(slug);
        if (!categoryData) {
          setIsLoading(false);
          return;
        }
        setCategory(categoryData);

        const { threads: threadsData, total: totalData } = await getThreadsByCategory(
          categoryData.id,
          page
        );
        setThreads(threadsData);
        setTotal(totalData);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug, page]);

  const totalPages = Math.ceil(total / 20);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400 text-2xl">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400 text-2xl">Category not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/forum"
              className="text-green-500 hover:text-green-400 mb-6 inline-flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t.backToForum}
            </Link>

            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-6xl font-bold mb-4">
                  {lang === 'uk' ? category.name_uk : category.name_en}
                </h1>
                {lang === 'uk' && category.description_uk && (
                  <p className="text-gray-400 text-lg">{category.description_uk}</p>
                )}
                {lang === 'en' && category.description_en && (
                  <p className="text-gray-400 text-lg">{category.description_en}</p>
                )}
              </div>

              <Link
                href={`/forum/${category.slug}/new`}
                className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
              >
                {t.newThread}
              </Link>
            </div>
          </div>

          {/* Threads List */}
          <div className="space-y-4">
            {threads.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg">{t.noThreads}</p>
              </div>
            ) : (
              threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/${category.slug}/${thread.id}`}
                  className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-6 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Thread Icon */}
                    <div className="flex-shrink-0">
                      {thread.is_pinned ? (
                        <svg
                          className="w-6 h-6 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Thread Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                            {thread.title}
                            {thread.is_locked && (
                              <svg
                                className="inline-block w-5 h-5 ml-2 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                              </svg>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>
                              {t.by} {thread.username}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(thread.created_at), {
                                addSuffix: true,
                                locale: lang === 'uk' ? uk : enUS,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>{thread.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{thread.reply_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/forum/${category.slug}?page=${page - 1}`}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                >
                  {t.previous}
                </Link>
              )}

              <span className="px-6 py-3 bg-green-500 text-black font-bold rounded-lg">
                {page} / {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/forum/${category.slug}?page=${page + 1}`}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                >
                  {t.next}
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}