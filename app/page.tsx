'use client';
import { useState } from 'react';
import { useLanguage } from './context/LanguageContext';

const translations = {
  uk: {
    news: 'Новини',
    heroTitle: 'БУДЬ В КУРСІ',
    heroSubtitle: 'Твоя історія починається тут — з кроку до мрій, ідей і змін.',
    readMore: 'Читати далі',
    footer: '© 2024 Всі права захищені'
  },
  en: {
    news: 'News',
    heroTitle: 'STAY INFORMED',
    heroSubtitle: 'Your story starts here — with a step toward dreams, ideas, and change.',
    readMore: 'Read More',
    footer: '© 2024 All rights reserved'
  }
};

export default function Website() {
  type Lang = keyof typeof translations;
  const { lang } = useLanguage(); 
  const t = translations[lang];

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
                <div className="text-6xl font-bold">
                  <span className="text-green-500">{lang === 'uk' ? 'Голос' : 'Voice'}</span>
                  <br />
                  <span>{lang === 'uk' ? 'Важливий' : 'Matters'}</span>
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
              {t.heroTitle}
            </h1>
            <p className="text-xl mb-12 text-gray-300 max-w-xl">
              {t.heroSubtitle}
            </p>
            <button className="bg-green-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition-all transform hover:scale-105">
              {t.readMore}
            </button>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="py-20 px-12 bg-gray-900">
          <h2 className="text-5xl font-bold mb-12">{t.news}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-64">
                  <img 
                    src={`https://images.unsplash.com/photo-${1550000000000 + item * 10000000}?w=400&h=300&fit=crop`}
                    alt={`News ${item}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  {lang === 'uk' ? `Новина ${item}` : `News ${item}`}
                </h3>
                <p className="text-gray-400">
                  {lang === 'uk' 
                    ? 'Короткий опис новини, що привертає увагу читача...'
                    : 'A brief description of the news that captures attention...'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}