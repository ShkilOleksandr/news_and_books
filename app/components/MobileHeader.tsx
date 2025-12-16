'use client'

import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import ForumAuthButtons from '@/app/components/forum/Forumauthbuttons';
import LogoTiles from '@/app/components/LogoTiles';
import { useIsAdmin } from '@/app/lib/useisadmin';

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
    chat: 'Чат',
    adminDashboard: 'Панель адміністратора'
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
    chat: 'Chat',
    adminDashboard: 'Admin Dashboard'
  }
};

export default function MobileHeader() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useIsAdmin();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <LogoTiles size="w-8 h-8" textSize="text-lg" letters={['K','E','T','A','N','E']} />
          </a>

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close icon (X)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Menu icon (☰)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-6 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Navigation Links */}
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.home}
            </a>
            <a
              href="/daily"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.daily}
            </a>
            <a
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.news}
            </a>
            <a
              href="/talents"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.talents}
            </a>
            <a
              href="/forum"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.forum}
            </a>
            <a
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.chat}
            </a>
            <a
              href="/archive"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.archive}
            </a>
            <a
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.about}
            </a>
            <a
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-gray-800 hover:text-green-500 rounded-lg transition-colors font-medium"
            >
              {t.contact}
            </a>

            {/* Admin Dashboard - Only visible to admins */}
            {isAdmin && (
              <a
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-gray-800 transition-colors bg-green-500/10 border-l-4 border-green-500 font-semibold rounded-lg flex items-center gap-2"
              >
                <span>⚙️</span>
                <span>{t.adminDashboard}</span>
              </a>
            )}

            {/* Auth Buttons */}
            <div className="pt-2 border-t border-gray-800 px-4">
              <ForumAuthButtons />
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2 pt-2 px-4 pb-2">
              <button
                onClick={() => {
                  setLang('uk');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors text-sm ${
                  lang === 'uk' 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                UK
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors text-sm ${
                  lang === 'en' 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}