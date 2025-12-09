'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';

const translations = {
  uk: {
    daily: 'Щоденна тема',
    date: 'Сьогодні',
    share: 'Поділитися',
    related: 'Схожі теми',
    readMore: 'Читати далі',
    backToHome: 'На головну',
    loading: 'Завантаження...',
    noTopic: 'Сьогодні немає щоденної теми',
    readTime: 'хв читання'
  },
  en: {
    daily: 'Daily Topic',
    date: 'Today',
    share: 'Share',
    related: 'Related Topics',
    readMore: 'Read More',
    backToHome: 'Back to Home',
    loading: 'Loading...',
    noTopic: 'No daily topic available today',
    readTime: 'min read'
  }
};

type DailyTopic = {
  id: number;
  title_uk: string;
  title_en: string;
  content_uk: string;
  content_en: string;
  main_image: string | null;
  read_time: number;
  date: string;
};


export default function DailyTopicPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<DailyTopic | null>(null);

  useEffect(() => {
    fetchDailyTopic();
  }, []);

  
const [relatedTopics, setRelatedTopics] = useState<DailyTopic[]>([]);

const fetchDailyTopic = async () => {
  // Get today's topic
  const { data, error } = await supabase
    .from('daily_topics')
    .select('*')
    .lte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (data && !error) {
    setTopic(data);
    
    // Fetch 3 other recent topics as related
    const { data: related } = await supabase
      .from('daily_topics')
      .select('id, title_uk, title_en, main_image')
      .neq('id', data.id) // Exclude current topic
      .order('date', { ascending: false })
      .limit(3);
    
    if (related) {
      setRelatedTopics(related as any);
    }
  }
  setLoading(false);
};

  if (!topic) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.noTopic}</h1>
          <a href="/" className="text-green-500 hover:text-green-400">
            {t.backToHome}
          </a>
        </div>
      </div>
    );
  }

  const title = lang === 'uk' ? topic.title_uk : topic.title_en;
  const content = lang === 'uk' ? topic.content_uk : topic.content_en;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <a href="/" className="inline-flex items-center text-green-500 hover:text-green-400 mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.backToHome}
        </a>

        {/* Category Badge */}
        <div className="inline-block bg-green-500 text-black px-4 py-1 rounded-full font-bold text-sm mb-12">
          {t.daily}
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-gray-400 mb-12 pb-8 border-b border-gray-800">
          <span suppressHydrationWarning>{new Date(topic.date).toLocaleDateString()}</span>
          {topic.read_time && (
            <>
              <span>•</span>
              <span>{topic.read_time} {t.readTime}</span>
            </>
          )}
          <button className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {t.share}
          </button>
        </div>

        {/* Hero Image */}
        {topic.main_image && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src={topic.main_image}
              alt={title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-16">
          <div 
            dangerouslySetInnerHTML={{ __html: content }}
            className="text-gray-300 leading-relaxed space-y-6"
          />
        </article>

        {/* Related Topics */}
<section>
  <h2 className="text-4xl font-bold mb-8">{t.related}</h2>
  {relatedTopics.length > 0 ? (
    <div className="grid md:grid-cols-3 gap-6">
      {relatedTopics.map((item) => (
        <a 
          key={item.id}
          href={`/daily`}
          className="group cursor-pointer"
                >
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
                    <img 
                      src={item.main_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop'}
                      alt={lang === 'uk' ? item.title_uk : item.title_en}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                    {lang === 'uk' ? item.title_uk : item.title_en}
                  </h3>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              {lang === 'uk' ? 'Немає інших тем' : 'No other topics'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}