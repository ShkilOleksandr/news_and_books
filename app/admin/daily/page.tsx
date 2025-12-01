'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    dailyTopics: 'Щоденні теми',
    backToDashboard: 'Назад до панелі',
    createNew: '+ Створити тему',
    edit: 'Редагувати',
    delete: 'Видалити',
    deleteConfirm: 'Ви впевнені, що хочете видалити цю тему?',
    loading: 'Завантаження...',
    noTopics: 'Немає тем'
  },
  en: {
    dailyTopics: 'Daily Topics',
    backToDashboard: 'Back to Dashboard',
    createNew: '+ Create Topic',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this topic?',
    loading: 'Loading...',
    noTopics: 'No topics'
  }
};

type DailyTopic = {
  id: number;
  title_uk: string;
  title_en: string;
  date: string;
};

export default function AdminDailyTopicsPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [topics, setTopics] = useState<DailyTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTopics();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/admin/login');
  };

  const fetchTopics = async () => {
    const { data } = await supabase
      .from('daily_topics')
      .select('id, title_uk, title_en, date')
      .order('date', { ascending: false });
    
    if (data) setTopics(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.deleteConfirm)) return;

    const { error } = await supabase
      .from('daily_topics')
      .delete()
      .eq('id', id);

    if (!error) {
      setTopics(prev => prev.filter(item => item.id !== id));
    }
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
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">K</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">Y</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">R</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">S</div>
            </div>
            <span className="text-gray-400">{t.dailyTopics}</span>
          </div>
          
          <a href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToDashboard}
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">{t.dailyTopics}</h1>
          
          <a href="/admin/daily/create" className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors">
            {t.createNew}
          </a>
        </div>

        {topics.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {t.noTopics}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden divide-y divide-gray-800">
            {topics.map((topic) => (
              <div key={topic.id} className="p-6 flex items-center justify-between hover:bg-gray-800 transition-colors">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {lang === 'uk' ? topic.title_uk : topic.title_en}
                  </h3>
                  <p className="text-sm text-gray-400" suppressHydrationWarning>
                    {new Date(topic.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a href={`/admin/daily/${topic.id}/edit`} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                    {t.edit}
                  </a>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg transition-colors"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}