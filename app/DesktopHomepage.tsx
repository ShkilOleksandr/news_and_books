'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import LoadingSpinner from './components/LoadingSpinner';

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

export default function DesktopHomepage() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);

  const translations = {
    uk: {
      romaCouncil: 'Рада Ромів України'
    },
    en: {
      romaCouncil: 'Roma Council of Ukraine'
    }
  };

  const t = translations[lang];

  useEffect(() => {
    fetchHomeData();
  }, [lang]);

  const fetchHomeData = async () => {
    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'home')
      .single();

    if (pageData) {
      setHomeContent(lang === 'uk' ? pageData.content_uk : pageData.content_en);
    }

    const { data: newsData } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (newsData) setFeaturedNews(newsData);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="hidden lg:block min-h-screen bg-black text-white">
      <main className="flex-1 pt-20">
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center py-20">

          {/* Center Grid - Only Flags */}
          <div className="w-full max-w-4xl grid grid-cols-2 gap-6 p-8">

            {/* Roma Council of Ukraine Section */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-white mb-6 text-center">
                {t.romaCouncil}
              </h2>
              <img 
                src="/flags/main_flag.png"
                alt={t.romaCouncil}
                className="w-full max-w-2xl object-contain"
              />
            </div>

            {/* 🇺🇦 Ukrainian Flag */}
            <img 
              src="/flags/ukrainian.png"
              alt="Ukrainian Flag"
              className="w-full aspect-[3/2] object-cover"
            />

            {/* 🟦🟩🔴 Romani Flag */}
            <img 
              src="/flags/romani.png"
              alt="Romani Flag"
              className="w-full aspect-[3/2] object-cover"
            />

          </div>

        </section>

        {/* NEWS SECTION */}
        <section id="news" className="py-20 px-12 bg-gray-900">
          <h2 className="text-5xl font-bold mb-12">{homeContent?.newsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredNews.map((item) => (
              <a key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-64">
                  <img
                    src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300'}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <span className="text-green-500 text-sm font-bold">
                  {lang === 'uk' ? item.category_uk : item.category_en}
                </span>
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