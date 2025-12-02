'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getThreadById, getPostsByThread, incrementThreadViews } from '@/app/lib/forum';
import type { ForumThread, ForumPost } from '@/app/types/forum';
import { formatDistanceToNow, format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import ReplyForm from '@/app/components/forum/ReplyForm';
import { 
  useIsAdmin, 
  adminPinThread, 
  adminUnpinThread,
  adminLockThread,
  adminUnlockThread,
  adminDeleteThread,
  adminDeletePost 
} from '@/app/lib/useisadmin';

const translations = {
  uk: {
    forum: 'Форум',
    loading: 'Завантаження...',
    notFound: 'Тему не знайдено',
    by: 'від',
    views: 'переглядів',
    replies: 'відповідей',
    locked: 'Закрито',
    pinned: 'Закріплено',
    edited: 'відредаговано',
    previous: 'Попередня',
    next: 'Наступна',
    threadLocked: 'Ця тема закрита для нових відповідей',
    adminActions: 'Дії адміністратора',
    pin: 'Закріпити',
    unpin: 'Відкріпити',
    lock: 'Закрити',
    unlock: 'Відкрити',
    deleteThread: 'Видалити тему',
    deletePost: 'Видалити',
    confirmDeleteThread: 'Ви впевнені, що хочете видалити цю тему? Всі відповіді також будуть видалені.',
    confirmDeletePost: 'Ви впевнені, що хочете видалити цей пост?',
  },
  en: {
    forum: 'Forum',
    loading: 'Loading...',
    notFound: 'Thread not found',
    by: 'by',
    views: 'views',
    replies: 'replies',
    locked: 'Locked',
    pinned: 'Pinned',
    edited: 'edited',
    previous: 'Previous',
    next: 'Next',
    threadLocked: 'This thread is locked for new replies',
    adminActions: 'Admin Actions',
    pin: 'Pin',
    unpin: 'Unpin',
    lock: 'Lock',
    unlock: 'Unlock',
    deleteThread: 'Delete Thread',
    deletePost: 'Delete',
    confirmDeleteThread: 'Are you sure you want to delete this thread? All replies will also be deleted.',
    confirmDeletePost: 'Are you sure you want to delete this post?',
  }
};

export default function ThreadDetailPage() {
  const { lang } = useLanguage();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const threadId = Number(params.id);
  const page = Number(searchParams.get('page')) || 1;

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    loadData();
  }, [threadId, page]);

  async function loadData() {
    try {
      const threadData = await getThreadById(threadId);
      if (!threadData || !threadData.category) {
        setIsLoading(false);
        return;
      }
      setThread(threadData);
      await incrementThreadViews(threadId);

      const { posts: postsData, total: totalData } = await getPostsByThread(threadId, page);
      setPosts(postsData);
      setTotal(totalData);
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePinToggle() {
    if (!thread) return;
    try {
      if (thread.is_pinned) {
        await adminUnpinThread(threadId);
      } else {
        await adminPinThread(threadId);
      }
      await loadData();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Помилка при зміні статусу закріплення');
    }
  }

  async function handleLockToggle() {
    if (!thread) return;
    try {
      if (thread.is_locked) {
        await adminUnlockThread(threadId);
      } else {
        await adminLockThread(threadId);
      }
      await loadData();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Помилка при зміні статусу блокування');
    }
  }

  async function handleDeleteThread() {
    if (!confirm(t.confirmDeleteThread)) return;
    try {
      await adminDeleteThread(threadId);
      router.push(`/forum/${slug}`);
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Помилка при видаленні теми');
    }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm(t.confirmDeletePost)) return;
    try {
      await adminDeletePost(postId);
      await loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Помилка при видаленні поста');
    }
  }

  const totalPages = Math.ceil(total / 20);

  if (isLoading || adminLoading) {
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

  if (!thread || !thread.category) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400 text-2xl">{t.notFound}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/forum" className="text-green-500 hover:text-green-400 transition-colors">
              {t.forum}
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/forum/${thread.category.slug}`}
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              {lang === 'uk' ? thread.category.name_uk : thread.category.name_en}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{thread.title}</span>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-red-400">{t.adminActions}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePinToggle}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
                >
                  {thread.is_pinned ? t.unpin : t.pin}
                </button>
                <button
                  onClick={handleLockToggle}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
                >
                  {thread.is_locked ? t.unlock : t.lock}
                </button>
                <button
                  onClick={handleDeleteThread}
                  className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {t.deleteThread}
                </button>
              </div>
            </div>
          )}

          {/* Thread Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-4xl font-bold flex-1">{thread.title}</h1>
              <div className="flex gap-2">
                {thread.is_pinned && (
                  <div className="flex items-center gap-1 text-green-500 text-sm bg-green-900/20 px-3 py-1 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
                    </svg>
                    <span>{t.pinned}</span>
                  </div>
                )}
                {thread.is_locked && (
                  <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-900/20 px-3 py-1 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                    </svg>
                    <span>{t.locked}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center">
                  <span className="text-green-400 font-semibold">
                    {thread.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-white">{thread.username}</span>
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(thread.created_at), {
                  addSuffix: true,
                  locale: lang === 'uk' ? uk : enUS,
                })}
              </span>
              <span>•</span>
              <span>{thread.view_count} {t.views}</span>
              <span>•</span>
              <span>{thread.reply_count} {t.replies}</span>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-300 text-lg leading-relaxed">{thread.content}</p>
            </div>
          </div>

          {/* Posts/Replies */}
          {posts.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {t.replies} ({thread.reply_count})
              </h2>
              {posts.map((post, index) => (
                <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center">
                        <span className="text-green-400 font-semibold text-lg">
                          {post.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white text-lg">{post.username}</span>
                          <span className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: lang === 'uk' ? uk : enUS,
                            })}
                            {post.is_edited && post.edited_at && (
                              <span className="ml-2">
                                ({t.edited} {formatDistanceToNow(new Date(post.edited_at), {
                                  addSuffix: true,
                                  locale: lang === 'uk' ? uk : enUS,
                                })})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-400 hover:text-red-300 text-sm transition-colors"
                            >
                              {t.deletePost}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-300 text-base leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mb-8 flex justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/forum/${slug}/${threadId}?page=${page - 1}`}
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
                  href={`/forum/${slug}/${threadId}?page=${page + 1}`}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                >
                  {t.next}
                </Link>
              )}
            </div>
          )}

          {/* Reply Form */}
          {!thread.is_locked && <ReplyForm threadId={threadId} categorySlug={thread.category.slug} />}

          {thread.is_locked && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-400 text-lg">{t.threadLocked}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}