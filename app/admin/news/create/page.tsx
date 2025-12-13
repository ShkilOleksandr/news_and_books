'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';

const translations = {
  uk: {
    createArticle: 'Створити статтю',
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
    authorBioUk: 'Біографія автора (Українська)',      // ADD THIS
    authorBioEn: 'Біографія автора (English)',         // ADD THIS
    authorImage: 'Фото автора (URL)',                  // ADD THIS
    imageUrl: 'URL зображення',
    readTime: 'Час читання (хвилин)',
    featured: 'Обране',
    publish: 'Опублікувати',
    publishing: 'Публікація...',
    required: "Обов'язкове поле",
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Оберіть категорію',
    pleaseWait: 'Зачекайте...',
    checkAuth: 'Перевірка авторізації...'
  },
  en: {
    createArticle: 'Create Article',
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
    authorBioUk: 'Author Bio (Ukrainian)',              // ADD THIS
    authorBioEn: 'Author Bio (English)',                // ADD THIS
    authorImage: 'Author Photo (URL)',                  // ADD THIS
    imageUrl: 'Image URL',
    readTime: 'Read Time (minutes)',
    featured: 'Featured',
    publish: 'Publish',
    publishing: 'Publishing...',
    required: 'Required field',
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Select category',
    pleaseWait: 'Please wait...',
    checkAuth: 'Checking authentication...'
  }
};

const categories = {
  uk: ['Технології', 'Екологія', 'Бізнес', 'Культура', 'Спорт', 'Здоров\'я'],
  en: ['Technology', 'Environment', 'Business', 'Culture', 'Sports', 'Health']
};

export default function CreateArticlePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
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
    author_bio_uk: '',          // ADD THIS
    author_bio_en: '',          // ADD THIS
    author_image: '',           // ADD THIS
    main_image: '',
    read_time: 5,
    featured: false
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
    } else {
      setLoading(false);
    }
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
    if (selectedIndex > 0) { // Skip the placeholder option
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

    // Validation
    if (!formData.title_uk || !formData.title_en || !formData.content_uk || !formData.content_en) {
      setError(t.required);
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('news')
      .insert([{
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
        main_image: formData.main_image || null,
        read_time: formData.read_time,
        featured: formData.featured
      }])
      .select();

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
        <div className="text-2xl">{t.checkAuth}</div>
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
            <span className="text-gray-400">{t.createArticle}</span>
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
        <h1 className="text-4xl font-bold mb-8">{t.createArticle}</h1>

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
              placeholder="<p>Ваш контент тут...</p>"
              required
            />
            <p className="text-sm text-gray-400 mt-2">HTML теги підтримуються: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, тощо</p>
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
              placeholder="<p>Your content here...</p>"
              required
            />
            <p className="text-sm text-gray-400 mt-2">HTML tags supported: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, etc</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.categoryUk} / {t.categoryEn}</label>
            <select
              onChange={handleCategoryChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">{t.selectCategory}</option>
              {categories[lang].map((category, index) => (
                <option key={index} value={category}>
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
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorBioUk}</label>
            <textarea
              name="author_bio_uk"
              value={formData.author_bio_uk}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.authorBioEn}</label>
            <textarea
              name="author_bio_en"
              value={formData.author_bio_en}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.authorImage}</label>
            <input
              type="url"
              name="author_image"
              value={formData.author_image}
              onChange={handleChange}
              placeholder={t.imagePlaceholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.imageUrl}</label>
            <input
              type="url"
              name="main_image"
              value={formData.main_image}
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

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {submitting ? t.publishing : t.publish}
            </button>
            
            <a
              href="/admin/dashboard"
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