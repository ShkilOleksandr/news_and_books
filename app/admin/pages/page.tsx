'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';

const translations = {
  uk: {
    pages: 'Сторінки',
    backToDashboard: 'Назад до панелі',
    edit: 'Редагувати',
    aboutPage: 'Про нас',
    contactPage: 'Контакти',
    lastUpdated: 'Оновлено',
    loading: 'Завантаження...'
  },
  en: {
    pages: 'Pages',
    backToDashboard: 'Back to Dashboard',
    edit: 'Edit',
    aboutPage: 'About',
    contactPage: 'Contact',
    lastUpdated: 'Updated',
    loading: 'Loading...'
  }
};

type Page = {
  id: string;
  title_uk: string;
  title_en: string;
  updated_at: string;
};

export default function AdminPagesPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchPages();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/admin/login');
  };

  const fetchPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('id, title_uk, title_en, updated_at')
      .order('id');
    
    if (data) setPages(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <LogoTiles />
            </div>
            <span className="text-gray-400">{t.pages}</span>
          </div>
          
          <a href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToDashboard}
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.pages}</h1>

        <div className="bg-gray-900 rounded-xl overflow-hidden divide-y divide-gray-800">
          {pages.map((page) => (
            <div key={page.id} className="p-6 flex items-center justify-between hover:bg-gray-800 transition-colors">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {lang === 'uk' ? page.title_uk : page.title_en}
                </h3>
                <p className="text-sm text-gray-400" suppressHydrationWarning>
                  {t.lastUpdated}: {new Date(page.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              
              <a
                href={`/admin/pages/${page.id}/edit`}
                className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
              >
                {t.edit}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}