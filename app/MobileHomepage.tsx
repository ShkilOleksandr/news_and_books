'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import LoadingSpinner from './components/LoadingSpinner';
import Flag from '@/app/components/Flag';

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
    <div className="lg:hidden min-h-screen bg-black text-white">
      <main className="pt-20 px-4">

        {/* HERO */}
        <section className="py-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            {homeContent?.heroTitle}
          </h1>
          <p className="text-base sm:text-lg mb-8 text-gray-300">
            {homeContent?.heroSubtitle}
          </p>
          <a 
            href="/news"
            className="inline-block bg-green-500 text-black px-6 py-3 rounded-lg font-bold text-base hover:bg-green-400 transition-colors w-full sm:w-auto text-center"
          >
            {homeContent?.readMore}
          </a>
        </section>

        {/* FLAGS */}
        <section className="py-8 grid grid-cols-2 gap-4">

          <Flag 
            src="/flags/ukrainian.png"
            alt="Ukrainian Flag"
            className="aspect-[3/2] rounded-lg shadow-lg"
          />

          <Flag 
            src="/flags/romani.png"
            alt="Romani Flag"
            className="aspect-[3/2] rounded-lg shadow-lg"
          />

        </section>

        {/* VOICE MATTERS */}
        <section className="py-8">
          <div className="bg-gradient-to-r from-green-500/20 to-transparent rounded-lg p-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {homeContent?.voiceMatters?.split(' ').map((word, i) => (
                <span key={i} className={i === 0 ? 'text-green-500' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h2>
          </div>
        </section>

        {/* GRID IMAGES */}
        <section className="py-8 grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="aspect-square bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-20 h-20 bg-black rounded-full"></div>
          </div>

          <div className="col-span-2 aspect-video rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=300"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="col-span-2 aspect-video rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
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
