'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import type { Talent, TalentsCategory } from '@/app/types/talents';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Таланти',
    subtitle: 'Видатні українці, які надихають світ',
    allCategories: 'Всі категорії',
    featured: 'Відзначені',
    search: 'Пошук за іменем або досягненнями...',
    noTalents: 'Талантів не знайдено',
    viewProfile: 'Переглянути профіль',
    loading: 'Завантаження...',
    views: 'переглядів'
  },
  en: {
    title: 'Talents',
    subtitle: 'Outstanding Ukrainians inspiring the world',
    allCategories: 'All Categories',
    featured: 'Featured',
    search: 'Search by name or achievements...',
    noTalents: 'No talents found',
    viewProfile: 'View Profile',
    loading: 'Loading...',
    views: 'views'
  }
};

export default function TalentsPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [talents, setTalents] = useState<Talent[]>([]);
  const [categories, setCategories] = useState<TalentsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadTalents();
  }, [selectedCategory]);

  async function loadCategories() {
    const { data } = await supabase
      .from('talents_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
  }

  async function loadTalents() {
    setLoading(true);
    
    let query = supabase
      .from('talents')
      .select(`
        *,
        category:talents_categories(*)
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;

    if (data) {
      setTalents(data);
    }
    setLoading(false);
  }

  const filteredTalents = talents.filter((talent) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      talent.name_uk.toLowerCase().includes(query) ||
      talent.name_en.toLowerCase().includes(query) ||
      talent.title_uk?.toLowerCase().includes(query) ||
      talent.title_en?.toLowerCase().includes(query) ||
      talent.bio_uk.toLowerCase().includes(query) ||
      talent.bio_en.toLowerCase().includes(query) ||
      talent.achievements_uk?.toLowerCase().includes(query) ||
      talent.achievements_en?.toLowerCase().includes(query)
    );
  });

  const featuredTalents = filteredTalents.filter(t => t.is_featured);
  const regularTalents = filteredTalents.filter(t => !t.is_featured);

  return (
    <div className="min-h-screen text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4">{t.title}</h1>
            <p className="text-gray-400 text-xl">{t.subtitle}</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedCategory === null
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {t.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {lang === 'uk' ? cat.name_uk : cat.name_en}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <LoadingSpinner fullScreen={false} size="md" />
          )}

          {/* No Results */}
          {!loading && filteredTalents.length === 0 && (
            <div className="text-center text-gray-400 text-2xl py-20">
              {t.noTalents}
            </div>
          )}

          {/* Featured Talents */}
          {!loading && featuredTalents.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-green-500">⭐</span>
                {t.featured}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTalents.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Talents */}
          {!loading && regularTalents.length > 0 && (
            <div>
              {featuredTalents.length > 0 && (
                <h2 className="text-3xl font-bold mb-6">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.[lang === 'uk' ? 'name_uk' : 'name_en']
                    : t.allCategories
                  }
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularTalents.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Talent Card Component
function TalentCard({ talent }: { talent: Talent }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <Link href={`/talents/${talent.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors group cursor-pointer h-full flex flex-col">
        {/* Photo */}
        {talent.photo_url && (
          <div className="relative h-80 bg-gray-800 overflow-hidden">
            <img
              src={talent.photo_url}
              alt={lang === 'uk' ? talent.name_uk : talent.name_en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {talent.is_featured && (
              <div className="absolute top-4 right-4 bg-green-500 text-black px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
                ⭐ {t.featured}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-2xl font-bold mb-2 group-hover:text-green-500 transition-colors">
            {lang === 'uk' ? talent.name_uk : talent.name_en}
          </h3>

          {/* Title */}
          {talent.title_uk && (
            <p className="text-green-500 font-semibold mb-3">
              {lang === 'uk' ? talent.title_uk : talent.title_en}
            </p>
          )}

          {/* Bio Preview */}
          <p className="text-gray-400 mb-4 line-clamp-3 flex-1">
            {lang === 'uk' ? talent.bio_uk : talent.bio_en}
          </p>

          {/* Footer */}
          <div className="space-y-3">
            {/* Category */}
            {talent.category && (
              <div>
                <span className="inline-block bg-gray-800 text-green-500 text-sm font-bold px-3 py-1 rounded-full">
                  {lang === 'uk' ? talent.category.name_uk : talent.category.name_en}
                </span>
              </div>
            )}

            {/* Social Links */}
            {talent.social_links && Object.keys(talent.social_links).length > 0 && (
              <div className="flex gap-3">
                {talent.social_links.facebook && (
                  <a
                    href={talent.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {talent.social_links.instagram && (
                  <a
                    href={talent.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {talent.social_links.twitter && (
                  <a
                    href={talent.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {talent.social_links.linkedin && (
                  <a
                    href={talent.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {talent.social_links.youtube && (
                  <a
                    href={talent.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* View Button */}
            <div className="pt-2">
              <div className="w-full bg-green-500 hover:bg-green-400 text-black text-center px-6 py-3 rounded-lg font-bold transition-colors">
                {t.viewProfile}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}