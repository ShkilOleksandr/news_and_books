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

export default function MobileHomepage() {
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
    <div className="lg:hidden min-h-screen text-white">
      <main className="pt-20 px-4">

        {/* ROMA COUNCIL SECTION */}
        <section className="py-12">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
              {t.romaCouncil}
            </h2>
            <img 
              src="/flags/main_flag.png"
              alt={t.romaCouncil}
              className="w-full object-contain"
            />
          </div>
        </section>

        {/* FLAGS */}
        <section className="py-8 grid grid-cols-2 gap-4">

          <img 
            src="/flags/ukrainian.png"
            alt="Ukrainian Flag"
            className="w-full aspect-[3/2] object-cover"
          />

          <img 
            src="/flags/romani.png"
            alt="Romani Flag"
            className="w-full aspect-[3/2] object-cover"
          />

        </section>

        {/* NEWS */}
        <section className="py-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">{homeContent?.newsTitle}</h2>

          <div className="space-y-6">
            {featuredNews.map((item) => (
              <a key={item.id} href={`/news/${item.id}`} className="block group">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400'}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-green-500 text-xs font-bold uppercase">
                      {lang === 'uk' ? item.category_uk : item.category_en}
                    </span>
                    <h3 className="text-xl font-bold mt-2 mb-2 group-hover:text-green-500 transition-colors">
                      {lang === 'uk' ? item.title_uk : item.title_en}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {lang === 'uk' ? item.excerpt_uk : item.excerpt_en}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </section>

      </main>
    </div>
  );
}