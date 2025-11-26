'use client';
import { useLanguage } from '@/app/context/LanguageContext';
import { useState } from 'react';

const translations = {
  uk: {
    daily: 'Щоденна тема',
    news: 'Новини',
    about: 'Про нас',
    contact: 'Контакти',
    allNews: 'Всі новини',
    latest: 'Останні',
    featured: 'Обране',
    categories: 'Категорії',
    searchPlaceholder: 'Пошук новин...',
    readMore: 'Читати далі'
  },
  en: {
    daily: 'Daily Topic',
    news: 'News',
    about: 'About',
    contact: 'Contact',
    allNews: 'All News',
    latest: 'Latest',
    featured: 'Featured',
    categories: 'Categories',
    searchPlaceholder: 'Search news...',
    readMore: 'Read More'
  }
};

// Mock news data
const newsItems = [
  {
    id: 1,
    title_uk: 'Нові технології змінюють освіту',
    title_en: 'New Technologies Transform Education',
    excerpt_uk: 'Штучний інтелект та віртуальна реальність відкривають нові можливості для навчання...',
    excerpt_en: 'Artificial intelligence and virtual reality open new opportunities for learning...',
    category_uk: 'Технології',
    category_en: 'Technology',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop',
    date: '2024-11-25',
    featured: true
  },
  {
    id: 2,
    title_uk: 'Екологічні ініціативи в містах',
    title_en: 'Environmental Initiatives in Cities',
    excerpt_uk: 'Українські міста впроваджують нові програми для захисту довкілля та зниження викидів...',
    excerpt_en: 'Ukrainian cities implement new programs to protect the environment and reduce emissions...',
    category_uk: 'Екологія',
    category_en: 'Environment',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop',
    date: '2024-11-24',
    featured: true
  },
  {
    id: 3,
    title_uk: 'Розвиток стартап-екосистеми',
    title_en: 'Startup Ecosystem Development',
    excerpt_uk: 'Молоді підприємці отримують більше можливостей для розвитку своїх проектів...',
    excerpt_en: 'Young entrepreneurs get more opportunities to develop their projects...',
    category_uk: 'Бізнес',
    category_en: 'Business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
    date: '2024-11-23',
    featured: false
  },
  {
    id: 4,
    title_uk: 'Культурні події цього тижня',
    title_en: 'Cultural Events This Week',
    excerpt_uk: 'Огляд найцікавіших виставок, концертів та театральних вистав...',
    excerpt_en: 'Overview of the most interesting exhibitions, concerts and theater performances...',
    category_uk: 'Культура',
    category_en: 'Culture',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&h=400&fit=crop',
    date: '2024-11-22',
    featured: false
  },
  {
    id: 5,
    title_uk: 'Спортивні досягнення місяця',
    title_en: 'Sports Achievements of the Month',
    excerpt_uk: 'Українські спортсмени продовжують показувати видатні результати на міжнародній арені...',
    excerpt_en: 'Ukrainian athletes continue to show outstanding results on the international stage...',
    category_uk: 'Спорт',
    category_en: 'Sports',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
    date: '2024-11-21',
    featured: false
  },
  {
    id: 6,
    title_uk: 'Інновації в медицині',
    title_en: 'Innovations in Medicine',
    excerpt_uk: 'Нові методи лікування та діагностики стають доступнішими для пацієнтів...',
    excerpt_en: 'New treatment and diagnostic methods become more accessible to patients...',
    category_uk: 'Здоров\'я',
    category_en: 'Health',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    date: '2024-11-20',
    featured: false
  }
];

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
  const t = translations[lang];

  const featuredNews = newsItems.filter(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  return (
    <div className="min-h-screen bg-black text-white">


      {/* Main Content */}
      <main className="pt-24 pb-20">
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
                  <div key={item.id} className="group cursor-pointer">
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-80">
                      <img 
                        src={item.image}
                        alt={lang === 'uk' ? item.title_uk : item.title_en}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {lang === 'uk' ? item.category_uk : item.category_en}
                      </span>
                      <span className="text-gray-400 text-sm">{item.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-green-500 transition-colors">
                      {lang === 'uk' ? item.title_uk : item.title_en}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                    </p>
                    <button className="text-green-500 hover:text-green-400 font-bold transition-colors">
                      {t.readMore} →
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Latest News Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8">{t.latest}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {regularNews.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
                    <img 
                      src={item.image}
                      alt={lang === 'uk' ? item.title_uk : item.title_en}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {lang === 'uk' ? item.category_uk : item.category_en}
                    </span>
                    <span className="text-gray-400 text-sm">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                    {lang === 'uk' ? item.title_uk : item.title_en}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                  </p>
                  <button className="text-green-500 hover:text-green-400 text-sm font-bold transition-colors">
                    {t.readMore} →
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}