'use client';
import { use, useState } from 'react';

const translations = {
  uk: {
    daily: 'Щоденна тема',
    date: 'Сьогодні',
    share: 'Поділитися',
    related: 'Схожі теми',
    readMore: 'Читати далі',
    backToHome: 'На головну'
  },
  en: {
    daily: 'Daily Topic',
    date: 'Today',
    share: 'Share',
    related: 'Related Topics',
    readMore: 'Read More',
    backToHome: 'Back to Home'
  }
};

// Mock data for daily topic
const dailyContent = {
  uk: {
    title: 'Майбутнє зеленої енергії в Україні',
    date: '26 листопада 2024',
    readTime: '8 хв читання',
    content: `
      <p>Україна стоїть на порозі енергетичної революції. З кожним днем все більше українців розуміють важливість переходу на відновлювальні джерела енергії.</p>
      
      <p>Сонячна енергетика показує неймовірні результати. За останній рік встановлено понад 2 ГВт нових потужностей, що робить нашу країну одним з лідерів регіону.</p>
      
      <p>Вітрова енергетика також не відстає. Нові вітрові парки на півдні та заході країни генерують чисту енергію для мільйонів домівок.</p>
      
      <p>Це не просто про екологію - це про незалежність, про майбутнє наших дітей, про економічний розвиток.</p>
    `,
    tags: ['Енергетика', 'Екологія', 'Майбутнє', 'Технології']
  },
  en: {
    title: 'The Future of Green Energy in Ukraine',
    date: 'November 26, 2024',
    readTime: '8 min read',
    content: `
      <p>Ukraine stands on the threshold of an energy revolution. Every day, more Ukrainians understand the importance of transitioning to renewable energy sources.</p>
      
      <p>Solar energy shows incredible results. Over the past year, more than 2 GW of new capacity has been installed, making our country one of the regional leaders.</p>
      
      <p>Wind energy is not far behind. New wind farms in the south and west of the country generate clean energy for millions of homes.</p>
      
      <p>This is not just about ecology - it's about independence, about our children's future, about economic development.</p>
    `,
    tags: ['Energy', 'Ecology', 'Future', 'Technology']
  }
};

const relatedTopics = [
  {
    title_uk: 'Сонячні панелі для дому',
    title_en: 'Solar Panels for Home',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
  },
  {
    title_uk: 'Електромобілі в Україні',
    title_en: 'Electric Cars in Ukraine',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop'
  },
  {
    title_uk: 'Енергоефективність міст',
    title_en: 'Energy Efficiency of Cities',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop'
  }
];

export default function DailyTopicPage() {
  const [lang, setLang] = useState('uk');
  const t = translations[lang];
  const content = dailyContent[lang];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Main Content */}
      <main className="pt-24 pb-20">
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
            {content.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-gray-400 mb-12 pb-8 border-b border-gray-800">
            <span>{content.date}</span>
            <span>•</span>
            <span>{content.readTime}</span>
            <button className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t.share}
            </button>
          </div>

          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop"
              alt={content.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-invert prose-lg max-w-none mb-16">
            <div 
              dangerouslySetInnerHTML={{ __html: content.content }}
              className="text-gray-300 leading-relaxed space-y-6"
            />
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-16">
            {content.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Topics */}
          <section>
            <h2 className="text-4xl font-bold mb-8">{t.related}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedTopics.map((topic, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
                    <img 
                      src={topic.image}
                      alt={lang === 'uk' ? topic.title_uk : topic.title_en}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                    {lang === 'uk' ? topic.title_uk : topic.title_en}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}