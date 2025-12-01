'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    editTopic: 'Редагувати тему',
    backToTopics: 'Назад до тем',
    titleUk: 'Заголовок (Українська)',
    titleEn: 'Заголовок (English)',
    contentUk: 'Контент (Українська)',
    contentEn: 'Контент (English)',
    imageUrl: 'URL зображення',
    readTime: 'Час читання (хвилин)',
    date: 'Дата',
    save: 'Зберегти',
    saving: 'Збереження...',
    required: "Обов'язкове поле",
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    loading: 'Завантаження...',
    notFound: 'Тему не знайдено'
  },
  en: {
    editTopic: 'Edit Topic',
    backToTopics: 'Back to Topics',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    contentUk: 'Content (Ukrainian)',
    contentEn: 'Content (English)',
    imageUrl: 'Image URL',
    readTime: 'Read Time (minutes)',
    date: 'Date',
    save: 'Save Changes',
    saving: 'Saving...',
    required: 'Required field',
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    loading: 'Loading...',
    notFound: 'Topic not found'
  }
};

type DailyTopic = {
  id: number;
  title_uk: string;
  title_en: string;
  content_uk: string;
  content_en: string;
  main_image: string;
  read_time: number;
  date: string;
};

export default function EditDailyTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<DailyTopic>({
    id: 0,
    title_uk: '',
    title_en: '',
    content_uk: '',
    content_en: '',
    main_image: '',
    read_time: 5,
    date: ''
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const { data, error } = await supabase
      .from('daily_topics')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setFormData(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.title_uk || !formData.title_en || !formData.content_uk || !formData.content_en) {
      setError(t.required);
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('daily_topics')
      .update({
        title_uk: formData.title_uk,
        title_en: formData.title_en,
        content_uk: formData.content_uk,
        content_en: formData.content_en,
        main_image: formData.main_image || null,
        read_time: formData.read_time,
        date: formData.date
      })
      .eq('id', resolvedParams.id);

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      router.push('/admin/daily');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t.notFound}</h1>
          <a href="/admin/daily" className="text-green-500 hover:text-green-400">
            {t.backToTopics}
          </a>
        </div>
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
            <span className="text-gray-400">{t.editTopic}</span>
          </div>
          
          <a href="/admin/daily" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToTopics}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editTopic}</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.date} *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Title Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.titleUk} *</label>
            <input
              type="text"
              name="title_uk"
              value={formData.title_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Title English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.titleEn} *</label>
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Content Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.contentUk} *</label>
            <textarea
              name="content_uk"
              value={formData.content_uk}
              onChange={handleChange}
              rows={12}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-400 mt-2">HTML теги підтримуються</p>
          </div>

          {/* Content English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.contentEn} *</label>
            <textarea
              name="content_en"
              value={formData.content_en}
              onChange={handleChange}
              rows={12}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-400 mt-2">HTML tags supported</p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.imageUrl}</label>
            <input
              type="url"
              name="main_image"
              value={formData.main_image || ''}
              onChange={handleChange}
              placeholder={t.imagePlaceholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
            {formData.main_image && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img 
                  src={formData.main_image} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.readTime}</label>
            <input
              type="number"
              name="read_time"
              value={formData.read_time}
              onChange={handleChange}
              min="1"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {submitting ? t.saving : t.save}
            </button>
            
            <a
              href="/admin/daily"
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
            >
              {lang === 'uk' ? 'Скасувати' : 'Cancel'}
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}