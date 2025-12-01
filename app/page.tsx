'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';

type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  readMore: string;
  voiceMatters: string;
  newsTitle: string;
};

type NewsItem = {
  id: number;
  title_uk: string;
  title_en: string;
  excerpt_uk: string;
  excerpt_en: string;
  main_image: string | null;
  category_uk: string;
  category_en: string;
};

export default function Homepage() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchHomeData();
  }, [lang]);

  const fetchHomeData = async () => {
    // Fetch homepage content
    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'home')
      .single();

    if (pageData) {
      const content = lang === 'uk' ? pageData.content_uk : pageData.content_en;
      setHomeContent(content);
    }

    // Fetch featured news (latest 3)
    const { data: newsData } = await supabase
      .from('news')
      .select('id, title_uk, title_en, excerpt_uk, excerpt_en, main_image, category_uk, category_en')
      .order('created_at', { ascending: false })
      .limit(3);

    if (newsData) {
      setFeaturedNews(newsData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{lang === 'uk' ? 'Завантаження...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <section className="relative min-h-screen flex items-center">
          {/* Grid of images - right side */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 grid grid-cols-2 gap-4 p-8">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-24 h-24 bg-black rounded-full"></div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden col-span-2 relative">
              <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=300&fit=crop" alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent flex items-center justify-center">
                <div className="text-6xl font-bold text-center">
                  {homeContent?.voiceMatters?.split(' ').map((word, i) => (
                    <div key={i}>
                      <span className={i === 0 ? 'text-green-500' : ''}>{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden col-span-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop" alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
          </div>

          {/* Text content - left side */}
          <div className="relative z-10 max-w-3xl px-12 py-20">
            <h1 className="text-8xl font-bold mb-8 leading-tight" style={{ 
              WebkitTextStroke: '2px white',
              WebkitTextFillColor: 'transparent'
            }}>
              {homeContent?.heroTitle}
            </h1>
            <p className="text-xl mb-12 text-gray-300 max-w-xl">
              {homeContent?.heroSubtitle}
            </p>
            <a href="/news" className="inline-block bg-green-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition-all transform hover:scale-105">
              {homeContent?.readMore}
            </a>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="py-20 px-12 bg-gray-900">
          <h2 className="text-5xl font-bold mb-12">{homeContent?.newsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredNews.map((item) => (
              <a key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-64">
                  <img 
                    src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop'}
                    alt={lang === 'uk' ? item.title_uk : item.title_en}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <div className="mb-2">
                  <span className="text-green-500 text-sm font-bold">
                    {lang === 'uk' ? item.category_uk : item.category_en}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  {lang === 'uk' ? item.title_uk : item.title_en}
                </h3>
                <p className="text-gray-400">
                  {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                </p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}