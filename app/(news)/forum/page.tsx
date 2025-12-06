'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useEffect, useState } from 'react';
import { getForumCategories } from '@/app/lib/forum';
import type { ForumCategory } from '@/app/types/forum';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Форум',
    description: 'Обговорюйте новини та книги з іншими користувачами',
    loading: 'Завантаження...',
    noCategories: 'Категорії ще не створені. Зверніться до адміністратора.'
  },
  en: {
    title: 'Forum',
    description: 'Discuss news and books with other users',
    loading: 'Loading...',
    noCategories: 'No categories yet. Contact administrator.'
  }
};

export default function ForumPage() {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getForumCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Title */}
          <h1 className="text-6xl font-bold mb-4">{t.title}</h1>
          <p className="text-gray-400 text-lg mb-12">{t.description}</p>

          {/* Categories */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg">{t.noCategories}</p>
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/forum/${category.slug}`}
                  className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-8 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 group-hover:text-green-500 transition-colors">
                        {lang === 'uk' ? category.name_uk : category.name_en}
                      </h2>
                      {lang === 'uk' && category.description_uk && (
                        <p className="text-gray-400 text-lg">{category.description_uk}</p>
                      )}
                      {lang === 'en' && category.description_en && (
                        <p className="text-gray-400 text-lg">{category.description_en}</p>
                      )}
                    </div>
                    <div className="ml-6">
                      <svg
                        className="w-8 h-8 text-gray-500 group-hover:text-green-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}