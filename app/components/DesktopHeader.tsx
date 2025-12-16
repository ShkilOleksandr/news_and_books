'use client'

import { useLanguage } from '../context/LanguageContext';
import ForumAuthButtons from './forum/Forumauthbuttons';

const translations = {
  uk: {
    home: 'Головна',
    daily: 'Щоденна тема',
    news: 'Новини',
    about: 'Про нас',
    contact: 'Контакти',
    forum: 'Форум',
    archive: 'Архів',
    talents: 'Таланти',
    chat: 'Чат'
  },
  en: {
    home: 'Home',
    daily: 'Daily Topic',
    news: 'News',
    about: 'About',
    contact: 'Contact',
    forum: 'Forum',
    archive: 'Archive',
    talents: 'Talents',
    chat: 'Chat'
  }
};

export default function DesktopHeader() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Smaller on medium screens */}
          <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 flex items-center justify-center font-bold text-lg lg:text-xl text-black">K</div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 flex items-center justify-center font-bold text-lg lg:text-xl text-black">Y</div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 flex items-center justify-center font-bold text-lg lg:text-xl text-black">R</div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 flex items-center justify-center font-bold text-lg lg:text-xl text-black">S</div>
          </a>

          {/* Navigation Links - Smaller gaps on medium screens */}
          <nav className="flex items-center gap-3 xl:gap-6 flex-1 justify-center">
            <a href="/" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.home}</a>
            <a href="/daily" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.daily}</a>
            <a href="/news" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.news}</a>
            <a href="/talents" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.talents}</a>
            <a href="/forum" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.forum}</a>
            <a href="/chat" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.chat}</a>
            <a href="/archive" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.archive}</a>
            <a href="/about" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.about}</a>
            <a href="/contact" className="hover:text-green-500 transition-colors text-sm xl:text-base font-medium whitespace-nowrap">{t.contact}</a>
          </nav>
          
          {/* Right Side: Auth + Language - Compact on medium screens */}
          <div className="flex items-center gap-2 xl:gap-6 flex-shrink-0">
            {/* Auth Buttons */}
            <ForumAuthButtons />
            
            {/* Language Switcher - Smaller on medium screens */}
            <div className="flex gap-1 xl:gap-2">
              <button
                onClick={() => setLang('uk')}
                className={`px-2 xl:px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  lang === 'uk' 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                UK
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 xl:px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  lang === 'en' 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}