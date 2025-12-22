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

export default function DesktopHomepage() {
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
    <div className="hidden lg:block min-h-screen text-white">
      <main className="flex-1 pt-20">
        
        {/* HERO SECTION - FLAGS */}
        <section className="relative min-h-screen flex items-center justify-center py-20">
          <div className="w-full max-w-4xl grid grid-cols-2 gap-6 p-8">
            {/* Roma Council Header */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
                {t.romaCouncil}
              </h2>
              <img 
                src="/flags/main_flag.png"
                alt={t.romaCouncil}
                className="w-full max-w-2xl object-contain drop-shadow-2xl"
              />
            </div>

            {/* Ukrainian Flag */}
            <img 
              src="/flags/ukrainian.png"
              alt="Ukrainian Flag"
              className="w-full aspect-[3/2] object-cover rounded-lg shadow-xl"
            />

            {/* Romani Flag */}
            <img 
              src="/flags/romani.png"
              alt="Romani Flag"
              className="w-full aspect-[3/2] object-cover rounded-lg shadow-xl"
            />
          </div>
        </section>

        {/* GALLERY SECTION - No title, plain display, many images */}
        {homeContent?.galleryImages && homeContent.galleryImages.length > 0 && (
          <section className="py-20 px-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {homeContent.galleryImages
                  .sort((a, b) => a.order - b.order)
                  .map((image, index) => (
                    <div key={index} className="relative overflow-hidden">
                      <img 
                        src={image.url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                          <p className="text-white text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* LEADER SECTION */}
        {homeContent?.leaderName && (
          <section className="py-20 px-12 bg-gray-900/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold mb-12 text-center">{t.ourLeader}</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Leader Photo */}
                <div className="relative">
                  <img 
                    src={homeContent.leaderImageUrl || '/placeholder-leader.jpg'}
                    alt={homeContent.leaderName}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
                  />
                </div>

                {/* Leader Info */}
                <div>
                  <h3 className="text-4xl font-bold mb-2">{homeContent.leaderName}</h3>
                  <p className="text-2xl text-green-500 mb-6">{homeContent.leaderTitle}</p>
                  <div className="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                    {homeContent.leaderBio}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT ORGANIZATION SECTION */}
        <section className="py-20 px-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 text-center">{t.aboutOrganization}</h2>
            <div className="text-xl leading-relaxed text-gray-300 max-w-4xl mx-auto text-center whitespace-pre-line">
              {homeContent?.orgDescription}
            </div>
          </div>
        </section>

        {/* NEWS SECTION */}
        <section id="news" className="py-20 px-12 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 text-center">{homeContent?.newsTitle}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredNews.map((item) => (
                <a key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-64">
                    <img
                      src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300'}
                      alt={lang === 'uk' ? item.title_uk : item.title_en}
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
          </div>
        </section>

      </main>
    </div>
  );
}