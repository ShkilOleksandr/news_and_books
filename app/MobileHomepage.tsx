'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import LoadingSpinner from './components/LoadingSpinner';

type GalleryImage = {
  url: string;
  caption: string;
  order: number;
};

type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  readMore: string;
  voiceMatters: string;
  newsTitle: string;
  orgDescription: string;
  leaderName: string;
  leaderTitle: string;
  leaderBio: string;
  leaderImageUrl: string;
  galleryImages: GalleryImage[];
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

// Helper function to get optimized Supabase image URL
const getOptimizedImageUrl = (url: string, width: number = 600, quality: number = 75) => {
  if (!url) return url;
  
  // Check if it's a Supabase storage URL
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Add transformation parameters for mobile
    return `${url}?width=${width}&quality=${quality}`;
  }
  
  return url;
};

export default function MobileHomepage() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);

  const translations = {
    uk: {
      romaCouncil: 'Рада Ромів України',
      aboutOrganization: 'Про організацію',
      ourLeader: 'Наш лідер'
    },
    en: {
      romaCouncil: 'Roma Council of Ukraine',
      aboutOrganization: 'About Organization',
      ourLeader: 'Our Leader'
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
              {t.romaCouncil}
            </h2>
            <img 
              src="/flags/main_flag.png"
              alt={t.romaCouncil}
              className="w-full object-contain drop-shadow-2xl"
              loading="eager"
            />
          </div>
        </section>

        {/* FLAGS */}
        <section className="py-8 grid grid-cols-2 gap-4">
          <img 
            src="/flags/ukrainian.png"
            alt="Ukrainian Flag"
            className="w-full aspect-[3/2] object-cover rounded-lg shadow-lg"
            loading="eager"
          />

          <img 
            src="/flags/romani.png"
            alt="Romani Flag"
            className="w-full aspect-[3/2] object-cover rounded-lg shadow-lg"
            loading="eager"
          />
        </section>

        {/* GALLERY SECTION - Optimized for mobile */}
        {homeContent?.galleryImages && homeContent.galleryImages.length > 0 && (
          <section className="py-12">
            <div className="grid grid-cols-2 gap-3">
              {homeContent.galleryImages
                .sort((a, b) => a.order - b.order)
                .map((image, index) => (
                  <div key={index} className="relative overflow-hidden bg-gray-900">
                    <img 
                      src={getOptimizedImageUrl(image.url, 400, 70)}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                        <p className="text-white text-xs">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* LEADER SECTION */}
        {homeContent?.leaderName && (
          <section className="py-12">
            <h2 className="text-3xl font-bold mb-8 text-center">{t.ourLeader}</h2>
            <div className="space-y-6">
              {/* Leader Photo - Optimized */}
              <div className="relative bg-gray-900">
                <img 
                  src={getOptimizedImageUrl(homeContent.leaderImageUrl, 600, 80)}
                  alt={homeContent.leaderName}
                  className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Leader Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{homeContent.leaderName}</h3>
                <p className="text-lg text-green-500 mb-4">{homeContent.leaderTitle}</p>
                <div className="text-base leading-relaxed text-gray-300 whitespace-pre-line">
                  {homeContent.leaderBio}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT ORGANIZATION */}
        <section className="py-12">
          <h2 className="text-3xl font-bold mb-6 text-center">{t.aboutOrganization}</h2>
          <div className="text-base leading-relaxed text-gray-300 whitespace-pre-line">
            {homeContent?.orgDescription}
          </div>
        </section>

        {/* NEWS */}
        <section className="py-12 bg-gray-900">
          <div className="px-4">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">{homeContent?.newsTitle}</h2>

            <div className="space-y-6">
              {featuredNews.map((item) => (
                <a key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400'}
                        alt={lang === 'uk' ? item.title_uk : item.title_en}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                        decoding="async"
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
          </div>
        </section>

      </main>
    </div>
  );
}