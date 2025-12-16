'use client';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// Add this type definition
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
  main_image: string | null;
  author_uk: string;
  author_en: string;
  featured: boolean;
  read_time: number;
  created_at: string;
};

const translations = {
  uk: {
    allNews: 'Всі новини',
    latest: 'Останні',
    featured: 'Обране',
    searchPlaceholder: 'Пошук новин...',
    readMore: 'Читати далі'
  },
  en: {
    allNews: 'All News',
    latest: 'Latest',
    featured: 'Featured',
    searchPlaceholder: 'Search news...',
    readMore: 'Read More'
  }
};

const categories = [
  { uk: 'Всі', en: 'All' },
  { uk: 'Технології', en: 'Technology' },
  { uk: 'Екологія', en: 'Environment' },
  { uk: 'Бізнес', en: 'Business' },
  { uk: 'Культура', en: 'Culture' },
  { uk: 'Спорт', en: 'Sports' },
  { uk: 'Здоров\'я', en: 'Health' }
];

export default function NewsPage() {
  const { lang } = useLanguage(); 
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  // Fetch news from Supabase
  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching news:', error);
        setNewsItems([]); // Set empty array on error
      } else {
        setNewsItems(data as NewsItem[] || []); // Cast to NewsItem[]
      }
      setLoading(false);
    }

      fetchNews();
    }, []);

  const featuredNews = newsItems.filter(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Title */}
          <h1 className="text-6xl font-bold mb-12">{t.allNews}</h1>

          {/* Search and Filter Bar */}
          <div className="mb-12 space-y-6">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-green-500 transition-colors"
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(lang === 'uk' ? category.uk : category.en)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    selectedCategory === (lang === 'uk' ? category.uk : category.en)
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {lang === 'uk' ? category.uk : category.en}
                </button>
              ))}
            </div>
          </div>

          {/* Featured News */}
          {featuredNews.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8">{t.featured}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredNews.map((item) => (
                  <a key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-80">
                      <img 
                        src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop'}
                        alt={lang === 'uk' ? item.title_uk : item.title_en}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {lang === 'uk' ? item.category_uk : item.category_en}
                      </span>
                      <span className="text-gray-400 text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-green-500 transition-colors">
                      {lang === 'uk' ? item.title_uk : item.title_en}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                    </p>
                    <span className="text-green-500 hover:text-green-400 font-bold transition-colors">
                      {t.readMore} →
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Latest News Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8">{t.latest}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {regularNews.map((item) => (
                <a key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
                    <img 
                      src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400&fit=crop'}
                      alt={lang === 'uk' ? item.title_uk : item.title_en}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {lang === 'uk' ? item.category_uk : item.category_en}
                    </span>
                    <span className="text-gray-400 text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                    {lang === 'uk' ? item.title_uk : item.title_en}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                  </p>
                  <span className="text-green-500 hover:text-green-400 text-sm font-bold transition-colors">
                    {t.readMore} →
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}