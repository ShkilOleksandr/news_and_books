'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    editHome: 'Редагувати головну сторінку',
    backToPages: 'Назад до сторінок',
    heroTitleUk: 'Заголовок героя (Українська)',
    heroTitleEn: 'Заголовок героя (English)',
    heroSubtitleUk: 'Підзаголовок (Українська)',
    heroSubtitleEn: 'Підзаголовок (English)',
    readMoreUk: 'Текст кнопки (Українська)',
    readMoreEn: 'Текст кнопки (English)',
    voiceMattersUk: 'Текст "Voice Matters" (Українська)',
    voiceMattersEn: 'Текст "Voice Matters" (English)',
    newsTitleUk: 'Заголовок секції новин (Українська)',
    newsTitleEn: 'Заголовок секції новин (English)',
    save: 'Зберегти',
    saving: 'Збереження...',
    loading: 'Завантаження...',
    helper: 'Примітка: Новини на головній сторінці показують останні 3 статті автоматично.'
  },
  en: {
    editHome: 'Edit Homepage',
    backToPages: 'Back to Pages',
    heroTitleUk: 'Hero Title (Ukrainian)',
    heroTitleEn: 'Hero Title (English)',
    heroSubtitleUk: 'Hero Subtitle (Ukrainian)',
    heroSubtitleEn: 'Hero Subtitle (English)',
    readMoreUk: 'Button Text (Ukrainian)',
    readMoreEn: 'Button Text (English)',
    voiceMattersUk: 'Voice Matters Text (Ukrainian)',
    voiceMattersEn: 'Voice Matters Text (English)',
    newsTitleUk: 'News Section Title (Ukrainian)',
    newsTitleEn: 'News Section Title (English)',
    save: 'Save Changes',
    saving: 'Saving...',
    loading: 'Loading...',
    helper: 'Note: News on homepage automatically shows the latest 3 articles.'
  }
};

export default function EditHomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle_uk: '',
    heroTitle_en: '',
    heroSubtitle_uk: '',
    heroSubtitle_en: '',
    readMore_uk: '',
    readMore_en: '',
    voiceMatters_uk: '',
    voiceMatters_en: '',
    newsTitle_uk: '',
    newsTitle_en: ''
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

    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'home')
      .single();

    if (data) {
      setFormData({
        heroTitle_uk: data.content_uk.heroTitle || '',
        heroTitle_en: data.content_en.heroTitle || '',
        heroSubtitle_uk: data.content_uk.heroSubtitle || '',
        heroSubtitle_en: data.content_en.heroSubtitle || '',
        readMore_uk: data.content_uk.readMore || '',
        readMore_en: data.content_en.readMore || '',
        voiceMatters_uk: data.content_uk.voiceMatters || '',
        voiceMatters_en: data.content_en.voiceMatters || '',
        newsTitle_uk: data.content_uk.newsTitle || '',
        newsTitle_en: data.content_en.newsTitle || ''
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('pages')
      .update({
        content_uk: {
          heroTitle: formData.heroTitle_uk,
          heroSubtitle: formData.heroSubtitle_uk,
          readMore: formData.readMore_uk,
          voiceMatters: formData.voiceMatters_uk,
          newsTitle: formData.newsTitle_uk
        },
        content_en: {
          heroTitle: formData.heroTitle_en,
          heroSubtitle: formData.heroSubtitle_en,
          readMore: formData.readMore_en,
          voiceMatters: formData.voiceMatters_en,
          newsTitle: formData.newsTitle_en
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', 'home');

    if (!error) {
      router.push('/admin/pages');
    }
    setSubmitting(false);
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
            <span className="text-gray-400">{t.editHome}</span>
          </div>
          
          <a href="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToPages}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editHome}</h1>

        <div className="bg-blue-500/20 border border-blue-500 text-blue-400 p-4 rounded-lg mb-8">
          {t.helper}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Title */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.heroTitleUk}</label>
            <input
              type="text"
              name="heroTitle_uk"
              value={formData.heroTitle_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.heroTitleEn}</label>
            <input
              type="text"
              name="heroTitle_en"
              value={formData.heroTitle_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Hero Subtitle */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.heroSubtitleUk}</label>
            <textarea
              name="heroSubtitle_uk"
              value={formData.heroSubtitle_uk}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.heroSubtitleEn}</label>
            <textarea
              name="heroSubtitle_en"
              value={formData.heroSubtitle_en}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Read More Button */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.readMoreUk}</label>
            <input
              type="text"
              name="readMore_uk"
              value={formData.readMore_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.readMoreEn}</label>
            <input
              type="text"
              name="readMore_en"
              value={formData.readMore_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Voice Matters */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.voiceMattersUk}</label>
            <input
              type="text"
              name="voiceMatters_uk"
              value={formData.voiceMatters_uk}
              onChange={handleChange}
              placeholder="Голос Важливий"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.voiceMattersEn}</label>
            <input
              type="text"
              name="voiceMatters_en"
              value={formData.voiceMatters_en}
              onChange={handleChange}
              placeholder="Voice Matters"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* News Title */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.newsTitleUk}</label>
            <input
              type="text"
              name="newsTitle_uk"
              value={formData.newsTitle_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.newsTitleEn}</label>
            <input
              type="text"
              name="newsTitle_en"
              value={formData.newsTitle_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
          >
            {submitting ? t.saving : t.save}
          </button>
        </form>
      </main>
    </div>
  );
}