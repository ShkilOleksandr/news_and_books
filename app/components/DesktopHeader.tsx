'use client';

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
    adminDashboard: 'Панель адміністратора',
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
    adminDashboard: 'Admin Dashboard',
  },
};

export default function DesktopHeader() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const { isAdmin } = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* MAIN HEADER */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-1">
            <LogoTiles
              size="w-9 h-9"
              textSize="text-xl"
              letters={['K', 'E', 'T', 'A', 'N', 'E']}
            />
          </a>

          {/* MAIN NAV */}
          <nav className="flex items-center gap-6 text-sm font-medium text-white">
            <a href="/daily" className="hover:text-green-500 transition-colors">
              {t.daily}
            </a>
            <a href="/news" className="hover:text-green-500 transition-colors">
              {t.news}
            </a>
            <a href="/chat" className="hover:text-green-500 transition-colors">
              {t.chat}
            </a>
            <a href="/archive" className="hover:text-green-500 transition-colors">
              {t.archive}
            </a>

            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="px-3 py-1 rounded bg-green-500/10 hover:text-green-500 transition-colors"
              >
                ⚙️ {t.adminDashboard}
              </a>
            )}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            <ForumAuthButtons />

            {/* MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-white hover:text-green-500 transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MENU (SECONDARY ONLY) */}
      {menuOpen && (
  <>
    {/* Dim background */}
    <div
      className="fixed inset-0 z-40 bg-black/40"
      onClick={() => setMenuOpen(false)}
    />

    {/* Side menu */}
    <div className="fixed top-0 right-0 z-50 h-full w-[380px] bg-black border-l border-gray-800 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <LogoTiles
          size="w-8 h-8"
          textSize="text-lg"
          letters={['K','E','T','A','N','E']}
        />

        <button
          onClick={() => setMenuOpen(false)}
          className="p-2 text-white hover:text-green-500 transition"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex flex-col px-5 py-4 gap-1 text-white text-base">

        <a href="/" onClick={() => setMenuOpen(false)} className="menu-item-desktop">
          {t.home}
        </a>
        <a href="/talents" onClick={() => setMenuOpen(false)} className="menu-item-desktop">
          {t.talents}
        </a>
        <a href="/forum" onClick={() => setMenuOpen(false)} className="menu-item-desktop">
          {t.forum}
        </a>
        <a href="/about" onClick={() => setMenuOpen(false)} className="menu-item-desktop">
          {t.about}
        </a>
        <a href="/contact" onClick={() => setMenuOpen(false)} className="menu-item-desktop">
          {t.contact}
        </a>

      </nav>

      {/* Language switcher */}
      <div className="mt-auto px-5 py-4 border-t border-gray-800 flex gap-3">
        <button
          onClick={() => { setLang('uk'); setMenuOpen(false); }}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold ${
            lang === 'uk'
              ? 'bg-green-500 text-black'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          UK
        </button>

        <button
          onClick={() => { setLang('en'); setMenuOpen(false); }}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold ${
            lang === 'en'
              ? 'bg-green-500 text-black'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  </>
)}

    </>
  );
}
