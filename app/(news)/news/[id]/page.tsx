'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useLanguage } from '@/app/context/LanguageContext';

type NewsArticle = {
  id: number;
  title_uk: string;
  title_en: string;
  content_uk: string;
  content_en: string;
  excerpt_uk: string;
  excerpt_en: string;
  category_uk: string;
  category_en: string;
  author_uk: string;
  author_en: string;
  main_image: string | null;
  read_time: number;
  created_at: string;
  author_bio_uk?: string;
  author_bio_en?: string;
  author_image?: string;
};



export default function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { lang } = useLanguage();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  type RelatedArticle = {
    id: number;
    title_uk: string;
    title_en: string;
    main_image: string | null;
    category_uk: string;
    category_en: string;
  };
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]); // Add this
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setArticle(data);
    
    // Fetch related articles from the same category
    const { data: related } = await supabase
      .from('news')
      .select('id, title_uk, title_en, main_image, category_uk, category_en')
      .eq('category_uk', data.category_uk)
      .neq('id', resolvedParams.id) // Exclude current article
      .limit(3);
    
    if (related) {
      setRelatedArticles(related);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-2xl">{lang === 'uk' ? 'Завантаження...' : 'Loading...'}</div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {lang === 'uk' ? 'Статтю не знайдено' : 'Article not found'}
          </h1>
          <a href="/news" className="text-green-500 hover:text-green-400">
            {lang === 'uk' ? 'Повернутися до новин' : 'Back to news'}
          </a>
        </div>
      </div>
    );
  }

  const title = lang === 'uk' ? article.title_uk : article.title_en;
  const content = lang === 'uk' ? article.content_uk : article.content_en;
  const author = lang === 'uk' ? article.author_uk : article.author_en;
  const category = lang === 'uk' ? article.category_uk : article.category_en;
  const authorBio = lang === 'uk' ? article.author_bio_uk : article.author_bio_en;
  const authorImage = article.author_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces';

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <article className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-8">
          <a href="/" className="hover:text-green-500 transition-colors">
            {lang === 'uk' ? 'Головна' : 'Home'}
          </a>
          <span>/</span>
          <a href="/news" className="hover:text-green-500 transition-colors">
            {lang === 'uk' ? 'Новини' : 'News'}
          </a>
          <span>/</span>
          <span className="text-white">{title}</span>
        </div>

        {/* Category Badge */}
        {category && (
          <div className="inline-block bg-green-500 text-black px-4 py-1 rounded-full font-bold text-sm mb-6">
            {category}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-gray-800">
          {author && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                    alt={author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-white">{author}</span>
              </div>
              <span>•</span>
            </>
          )}
          <span suppressHydrationWarning>{new Date(article.created_at).toLocaleDateString()}</span>
          {article.read_time && (
            <>
              <span>•</span>
              <span>{article.read_time} {lang === 'uk' ? 'хв читання' : 'min read'}</span>
            </>
          )}
          
          {/* Share Button */}
          <button className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {lang === 'uk' ? 'Поділитися' : 'Share'}
          </button>
        </div>

        {/* Featured Image */}
        {article.main_image && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src={article.main_image}
              alt={title}
              className="w-full h-96 md:h-[500px] object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            color: '#d1d5db',
            lineHeight: '1.8'
          }}
        />

        {/* Author Bio */}
        {author && (
          <div className="bg-gray-900 p-8 rounded-2xl mb-16">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={authorImage}
                  alt={author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{author}</h3>
                <p className="text-gray-400 mb-4">
                  {authorBio || (lang === 'uk' 
                    ? 'Журналіст з багаторічним досвідом роботи.'
                    : 'Journalist with many years of experience.')}
                </p>
                {/* ... social icons ... */}
              </div>
            </div>
          </div>
        )}

          {/* Related Articles */}
          <section>
            <h2 className="text-4xl font-bold mb-8">
              {lang === 'uk' ? 'Схожі статті' : 'Related Articles'}
            </h2>
            {relatedArticles.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {relatedArticles.map((item) => (
                  <a 
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
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
                    <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                      {lang === 'uk' ? item.title_uk : item.title_en}
                    </h3>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                {lang === 'uk' ? 'Немає схожих статей' : 'No related articles'}
              </p>
            )}
          </section>
      </article>
    </div>
  );
}