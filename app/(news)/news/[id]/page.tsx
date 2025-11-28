'use client'
import { useState } from 'react';

// Mock article data - this will come from database later
const articleData = {
  1: {
    title_uk: 'Нові технології змінюють освіту',
    title_en: 'New Technologies Transform Education',
    date: '2024-11-25',
    author_uk: 'Олена Петренко',
    author_en: 'Olena Petrenko',
    category_uk: 'Технології',
    category_en: 'Technology',
    readTime: '8',
    mainImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=600&fit=crop',
    content_uk: `
      <p>Штучний інтелект та віртуальна реальність відкривають нові можливості для навчання. Сучасні технології дозволяють створювати інтерактивні уроки, які адаптуються до індивідуальних потреб кожного учня.</p>
      
      <p>За останні роки освітні заклади України активно впроваджують цифрові інструменти. Від простих онлайн-платформ до складних систем з використанням AI - технології змінюють підхід до навчання.</p>
      
      <h2>Віртуальна реальність в освіті</h2>
      
      <p>VR-технології дозволяють учням відвідувати віртуальні музеї, здійснювати подорожі в історію або досліджувати людське тіло зсередини. Це робить навчання не лише ефективнішим, але й значно цікавішим.</p>
      
      <p>Деякі школи вже використовують VR-окуляри для вивчення географії, історії та біології. Результати показують значне підвищення залученості учнів та покращення засвоєння матеріалу.</p>
      
      <h2>Штучний інтелект як персональний репетитор</h2>
      
      <p>AI-системи аналізують успішність кожного учня та пропонують персоналізовані завдання. Якщо учень має труднощі з певною темою, система автоматично надає додаткові матеріали та вправи.</p>
      
      <p>Це особливо важливо в умовах, коли один вчитель працює з великою кількістю учнів. Технології допомагають приділити увагу кожному, не збільшуючи навантаження на педагогів.</p>
      
      <h2>Виклики та перспективи</h2>
      
      <p>Звісно, впровадження нових технологій має свої виклики. Необхідність навчання вчителів, забезпечення обладнанням та підтримка систем вимагає значних інвестицій.</p>
      
      <p>Проте результати варті того. Діти, які навчаються з використанням сучасних технологій, краще підготовлені до майбутнього, де цифрові навички стануть обов'язковими в більшості професій.</p>
    `,
    content_en: `
      <p>Artificial intelligence and virtual reality open new opportunities for learning. Modern technologies allow creating interactive lessons that adapt to the individual needs of each student.</p>
      
      <p>In recent years, Ukrainian educational institutions have been actively implementing digital tools. From simple online platforms to complex AI-powered systems - technologies are changing the approach to learning.</p>
      
      <h2>Virtual Reality in Education</h2>
      
      <p>VR technologies allow students to visit virtual museums, travel through history, or explore the human body from the inside. This makes learning not only more effective but also much more interesting.</p>
      
      <p>Some schools already use VR headsets to study geography, history, and biology. Results show a significant increase in student engagement and improved material retention.</p>
      
      <h2>Artificial Intelligence as a Personal Tutor</h2>
      
      <p>AI systems analyze each student's performance and offer personalized assignments. If a student has difficulties with a particular topic, the system automatically provides additional materials and exercises.</p>
      
      <p>This is especially important when one teacher works with a large number of students. Technology helps pay attention to everyone without increasing the workload on teachers.</p>
      
      <h2>Challenges and Prospects</h2>
      
      <p>Of course, implementing new technologies has its challenges. The need to train teachers, provide equipment, and maintain systems requires significant investment.</p>
      
      <p>However, the results are worth it. Children who learn using modern technologies are better prepared for the future, where digital skills will become mandatory in most professions.</p>
    `,
    tags_uk: ['Освіта', 'Технології', 'AI', 'VR', 'Майбутнє'],
    tags_en: ['Education', 'Technology', 'AI', 'VR', 'Future']
  }
};

const relatedArticles = [
  {
    id: 2,
    title_uk: 'Електромобілі в Україні',
    title_en: 'Electric Cars in Ukraine',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
    category_uk: 'Технології',
    category_en: 'Technology'
  },
  {
    id: 3,
    title_uk: 'Сонячна енергетика',
    title_en: 'Solar Energy',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    category_uk: 'Екологія',
    category_en: 'Environment'
  },
  {
    id: 4,
    title_uk: 'Цифрова трансформація бізнесу',
    title_en: 'Digital Business Transformation',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    category_uk: 'Бізнес',
    category_en: 'Business'
  }
];

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  const [lang, setLang] = useState<'uk' | 'en'>('uk');
  
  // In a real app, you'd fetch the article based on params.id
  // For now, we'll use the mock data
  const article = articleData[1];
  
  if (!article) {
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
  const tags = lang === 'uk' ? article.tags_uk : article.tags_en;

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
        <div className="inline-block bg-green-500 text-black px-4 py-1 rounded-full font-bold text-sm mb-6">
          {category}
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-gray-800">
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
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime} {lang === 'uk' ? 'хв читання' : 'min read'}</span>
          
          {/* Share Button */}
          <button className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {lang === 'uk' ? 'Поділитися' : 'Share'}
          </button>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-2xl overflow-hidden">
          <img 
            src={article.mainImage}
            alt={title}
            className="w-full h-96 md:h-[500px] object-cover"
          />
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            color: '#d1d5db',
            lineHeight: '1.8'
          }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-16 pb-16 border-b border-gray-800">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio */}
        <div className="bg-gray-900 p-8 rounded-2xl mb-16">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces"
                alt={author}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{author}</h3>
              <p className="text-gray-400 mb-4">
                {lang === 'uk' 
                  ? 'Журналістка з 10-річним досвідом роботи в сфері освітніх технологій. Спеціалізується на темах інновацій та цифрової трансформації.'
                  : 'Journalist with 10 years of experience in educational technology. Specializes in innovation and digital transformation topics.'}
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <section>
          <h2 className="text-4xl font-bold mb-8">
            {lang === 'uk' ? 'Схожі статті' : 'Related Articles'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map((item) => (
              <a 
                key={item.id}
                href={`/news/${item.id}`}
                className="group cursor-pointer"
              >
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-48">
                  <img 
                    src={item.image}
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
        </section>
      </article>
    </div>
  );
}