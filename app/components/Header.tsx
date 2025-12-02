'use client'
import { useLanguage } from '../context/LanguageContext';

const translations = {
  uk: {
    home: 'Головна',
    daily: 'Щоденна тема',
    news: 'Новини',
    about: 'Про нас',
    contact: 'Контакти',
    forum: 'Форум'
  },
  en: {
    home: 'Home',
    daily: 'Daily Topic',
    news: 'News',
    about: 'About',
    contact: 'Contact',
    forum: 'Forum'
  }
};

export default function Header() {
  const { lang, setLang } = useLanguage(); // Use context instead of useState
  const t = translations[lang];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-green-500 flex items-center justify-center font-bold text-xl">K</div>
          <div className="w-10 h-10 bg-green-500 flex items-center justify-center font-bold text-xl">Y</div>
          <div className="w-10 h-10 bg-green-500 flex items-center justify-center font-bold text-xl">R</div>
          <div className="w-10 h-10 bg-green-500 flex items-center justify-center font-bold text-xl">S</div>
        </a>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <a href="/" className="hover:text-green-500 transition-colors text-lg">{t.home}</a>
          <a href="/daily" className="hover:text-green-500 transition-colors text-lg">{t.daily}</a>
          <a href="/news" className="hover:text-green-500 transition-colors text-lg">{t.news}</a>
          <a href="/about" className="hover:text-green-500 transition-colors text-lg">{t.about}</a>
          <a href="/contact" className="hover:text-green-500 transition-colors text-lg">{t.contact}</a>
          <a href="/forum" className="hover:text-green-500 transition-colors text-lg">{t.forum}</a>
          
          {/* Language Switcher */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setLang('uk')}
              className={`px-3 py-1 rounded ${lang === 'uk' ? 'bg-green-500 text-black' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
            >
              UK
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-green-500 text-black' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
            >
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}