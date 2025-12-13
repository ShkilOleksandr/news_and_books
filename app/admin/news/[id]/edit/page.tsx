'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';

const translations = {
  uk: {
    editArticle: 'Редагувати статтю',
    backToDashboard: 'Назад до панелі',
    titleUk: 'Заголовок (Українська)',
    titleEn: 'Заголовок (English)',
    excerptUk: 'Короткий опис (Українська)',
    excerptEn: 'Короткий опис (English)',
    contentUk: 'Контент (Українська)',
    contentEn: 'Контент (English)',
    categoryUk: 'Категорія (Українська)',
    categoryEn: 'Категорія (English)',
    authorUk: 'Автор (Українська)',
    authorEn: 'Автор (English)',
    authorBioUk: 'Біографія автора (Українська)',      // ADD
    authorBioEn: 'Біографія автора (English)',         // ADD
    authorImage: 'Фото автора (URL)',                  // ADD
    imageUrl: 'URL зображення',
    readTime: 'Час читання (хвилин)',
    featured: 'Обране',
    save: 'Зберегти',
    saving: 'Збереження...',
    required: "Обов'язкове поле",
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Оберіть категорію',
    loading: 'Завантаження...',
    checkAuth: 'Перевірка авторізації...',
    notFound: 'Статтю не знайдено',
    cancel: 'Скасувати'
  },
  en: {
    editArticle: 'Edit Article',
    backToDashboard: 'Back to Dashboard',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    excerptUk: 'Excerpt (Ukrainian)',
    excerptEn: 'Excerpt (English)',
    contentUk: 'Content (Ukrainian)',
    contentEn: 'Content (English)',
    categoryUk: 'Category (Ukrainian)',
    categoryEn: 'Category (English)',
    authorUk: 'Author (Ukrainian)',
    authorEn: 'Author (English)',
    authorBioUk: 'Author Bio (Ukrainian)',              // ADD
    authorBioEn: 'Author Bio (English)',                // ADD
    authorImage: 'Author Photo (URL)',                  // ADD
    imageUrl: 'Image URL',
    readTime: 'Read Time (minutes)',
    featured: 'Featured',
    save: 'Save Changes',
    saving: 'Saving...',
    required: 'Required field',
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Select category',
    loading: 'Loading...',
    checkAuth: 'Checking authentication...',
    notFound: 'Article not found',
    cancel: 'Cancel'
  }
};
const categories = {
  uk: ['Технології', 'Екологія', 'Бізнес', 'Культура', 'Спорт', 'Здоров\'я'],
  en: ['Technology', 'Environment', 'Business', 'Culture', 'Sports', 'Health']
};

type NewsItem = {
  id: number;
  title_uk: string;
  title_en: string;
  excerpt_uk: string;
  excerpt_en: string;
  content_uk: string;
  content_en: string;
  category_uk: string;
  category_en: string;
  author_uk: string;
  author_en: string;
  author_bio_uk: string;      // ADD
  author_bio_en: string;      // ADD
  author_image: string;       // ADD
  main_image: string | null;
  read_time: number;
  featured: boolean;
};

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [articleId, setArticleId] = useState<string>('');
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState<NewsItem>({
    id: 0,
    title_uk: '',
    title_en: '',
    excerpt_uk: '',
    excerpt_en: '',
    content_uk: '',
    content_en: '',
    category_uk: '',
    category_en: '',
    author_uk: '',
    author_en: '',
    author_bio_uk: '',
    author_bio_en: '',
    author_image: '',
    main_image: '',
    read_time: 5,
    featured: false
  });

  useEffect(() => {
  async function init() {
    // Get params
    const resolvedParams = await params;
    setArticleId(resolvedParams.id);
    
    // Check auth and load article
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Load article
    const { data, error } = await supabase
      .from('news')
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
  }

  init();
}, []);

  const checkAuthAndLoadArticle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Load article
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setFormData(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex;
    if (selectedIndex > 0) {
      setFormData(prev => ({
        ...prev,
        category_uk: categories.uk[selectedIndex - 1],
        category_en: categories.en[selectedIndex - 1]
      }));
    }
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
      .from('news')
      .update({
        title_uk: formData.title_uk,
        title_en: formData.title_en,
        excerpt_uk: formData.excerpt_uk,
        excerpt_en: formData.excerpt_en,
        content_uk: formData.content_uk,
        content_en: formData.content_en,
        category_uk: formData.category_uk,
        category_en: formData.category_en,
        author_uk: formData.author_uk,
        author_en: formData.author_en,
        author_bio_uk: formData.author_bio_uk,
        author_bio_en: formData.author_bio_en,
        author_image: formData.author_image,
        main_image: formData.main_image || null,
        read_time: formData.read_time,
        featured: formData.featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId);

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      router.push('/admin/dashboard');
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
          <a href="/admin/dashboard" className="text-green-500 hover:text-green-400">
            {t.backToDashboard}
          </a>
        </div>
      </div>
    );
  }

  // Get current category index
  const currentCategoryIndex = categories.uk.indexOf(formData.category_uk);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <LogoTiles />
            </div>
          <span className="text-gray-400">{t.editArticle}</span>
          </div>
          
          
          <a
            href="/admin/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← {t.backToDashboard}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editArticle}</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Excerpt Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.excerptUk}</label>
            <textarea
              name="excerpt_uk"
              value={formData.excerpt_uk}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Excerpt English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.excerptEn}</label>
            <textarea
              name="excerpt_en"
              value={formData.excerpt_en}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
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
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.categoryUk} / {t.categoryEn}</label>
            <select
              value={currentCategoryIndex >= 0 ? currentCategoryIndex : ''}
              onChange={handleCategoryChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">{t.selectCategory}</option>
              {categories[lang].map((category, index) => (
                <option key={index} value={index}>
                  {category} / {categories[lang === 'uk' ? 'en' : 'uk'][index]}
                </option>
              ))}
            </select>
          </div>

          {/* Author Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorUk}</label>
            <input
              type="text"
              name="author_uk"
              value={formData.author_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Author English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorEn}</label>
            <input
              type="text"
              name="author_en"
              value={formData.author_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
        {/* Author Bio Ukrainian */}
        <div>
        <label className="block text-sm font-bold mb-2">{t.authorBioUk}</label>
        <textarea
            name="author_bio_uk"
            value={formData.author_bio_uk || ''}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
        />
        </div>

        {/* Author Bio English */}
        <div>
        <label className="block text-sm font-bold mb-2">{t.authorBioEn}</label>
        <textarea
            name="author_bio_en"
            value={formData.author_bio_en || ''}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
        />
        </div>

        {/* Author Image */}
        <div>
        <label className="block text-sm font-bold mb-2">{t.authorImage}</label>
        <input
            type="url"
            name="author_image"
            value={formData.author_image || ''}
            onChange={handleChange}
            placeholder={t.imagePlaceholder}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
        />
        {formData.author_image && (
            <div className="mt-4 rounded-full overflow-hidden w-20 h-20">
            <img 
                src={formData.author_image} 
                alt="Author preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
            </div>
        )}
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

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-5 h-5 bg-gray-900 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="featured" className="text-sm font-bold cursor-pointer">
              {t.featured}
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {submitting ? t.saving : t.save}
            </button>
            
            <a
              href="/admin/dashboard"
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
            >
              {t.cancel}
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}

function eq(arg0: string, articleId: string) {
    throw new Error('Function not implemented.');
}
