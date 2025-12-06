'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    adminPanel: 'Адмін Панель',
    viewSite: 'Переглянути сайт',
    logout: 'Вийти',
    dashboard: 'Панель управління',
    createNewArticle: '+ Створити статтю',
    dailyTopics: 'Щоденні теми',
    editPages: 'Редагувати сторінки',
    forumCategories: 'Категорії форуму',
    documentArchive: 'Архів документів',
    talents: 'Таланти',
    newsletter: 'Розсилка',
    userManagement: 'Користувачі',
    totalArticles: 'Всього статей',
    featured: 'Обране',
    loggedInAs: 'Ви увійшли як',
    recentArticles: 'Останні статті',
    edit: 'Редагувати',
    delete: 'Видалити',
    deleteConfirm: 'Ви впевнені, що хочете видалити цю статтю?',
    loading: 'Завантаження...',
    contentManagement: 'Управління контентом',
    systemManagement: 'Управління системою'
  },
  en: {
    adminPanel: 'Admin Panel',
    viewSite: 'View Site',
    logout: 'Logout',
    dashboard: 'Dashboard',
    createNewArticle: '+ Create New Article',
    dailyTopics: 'Daily Topics',
    editPages: 'Edit Pages',
    forumCategories: 'Forum Categories',
    documentArchive: 'Document Archive',
    talents: 'Talents',
    newsletter: 'Newsletter',
    userManagement: 'Users',
    totalArticles: 'Total Articles',
    featured: 'Featured',
    loggedInAs: 'Logged in as',
    recentArticles: 'Recent Articles',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this article?',
    loading: 'Loading...',
    contentManagement: 'Content Management',
    systemManagement: 'System Management'
  }
};

type NewsItem = {
  id: number;
  title_uk: string;
  title_en: string;
  category_uk: string;
  category_en: string;
  featured: boolean;
  created_at: string;
};

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchNews();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  const fetchNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('id, title_uk, title_en, category_uk, category_en, featured, created_at')
      .order('created_at', { ascending: false });
    
    if (data) setNews(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.deleteConfirm)) return;

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (!error) {
      setNews(news.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold text-black">K</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold text-black">Y</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold text-black">R</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold text-black">S</div>
            </div>
            <span className="text-gray-400">{t.adminPanel}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              {t.viewSite}
            </a>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8">{t.dashboard}</h1>

        {/* Content Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-400">{t.contentManagement}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/admin/news/create"
              className="bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors text-center"
            >
              {t.createNewArticle}
            </a>
            <a
              href="/admin/daily"
              className="bg-gray-800 text-white px-6 py-4 rounded-lg font-bold hover:bg-gray-700 border border-gray-700 transition-colors text-center"
            >
              {t.dailyTopics}
            </a>
            <a
              href="/admin/pages"
              className="bg-gray-800 text-white px-6 py-4 rounded-lg font-bold hover:bg-gray-700 border border-gray-700 transition-colors text-center"
            >
              {t.editPages}
            </a>
            <a
              href="/admin/forum-categories"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-6 py-4 text-white font-bold transition-colors text-center"
            >
              {t.forumCategories}
            </a>
            <a
              href="/admin/archive"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-6 py-4 text-white font-bold transition-colors text-center"
            >
              {t.documentArchive}
            </a>
            <a
              href="/admin/talents"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-6 py-4 text-white font-bold transition-colors text-center"
            >
              {t.talents}
            </a>
          </div>
        </div>

        {/* System Management Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-gray-400">{t.systemManagement}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/admin/newsletter/send"
              className="bg-green-500 hover:bg-green-400 rounded-lg px-6 py-4 text-black font-bold transition-colors text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">✉️</span>
                <span>{lang === 'uk' ? 'Відправити розсилку' : 'Send Newsletter'}</span>
              </div>
              <p className="text-xs text-black/70 mt-2">
                {lang === 'uk' ? 'Створити і відправити email всім підписникам' : 'Create and send email to all subscribers'}
              </p>
            </a>
            <a
              href="/admin/newsletter"
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg px-6 py-4 text-white font-bold transition-colors text-center group"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">📧</span>
                <span>{lang === 'uk' ? 'Підписники' : 'Subscribers'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {lang === 'uk' ? 'Керування підписниками розсилки' : 'Manage newsletter subscribers'}
              </p>
            </a>
            <a
              href="/admin/users"
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg px-6 py-4 text-white font-bold transition-colors text-center group"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">👥</span>
                <span>{t.userManagement}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {lang === 'uk' ? 'Блокування користувачів' : 'Ban/unban users'}
              </p>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.totalArticles}</div>
            <div className="text-4xl font-bold">{news.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.featured}</div>
            <div className="text-4xl font-bold">{news.filter(n => n.featured).length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.loggedInAs}</div>
            <div className="text-lg font-bold truncate">{user.email}</div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">{t.recentArticles}</h2>
          </div>
          
          <div className="divide-y divide-gray-800">
            {news.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                {lang === 'uk' ? 'Немає статей' : 'No articles yet'}
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold">
                        {lang === 'uk' ? item.title_uk : item.title_en}
                      </h3>
                      {item.featured && (
                        <span className="bg-green-500 text-black px-2 py-1 rounded text-xs font-bold">
                          {t.featured.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                      <span>{lang === 'uk' ? item.category_uk : item.category_en}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/admin/news/${item.id}/edit`}
                      className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                    >
                      {t.edit}
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}