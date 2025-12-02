'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getForumCategoryBySlug } from '@/app/lib/forum';
import type { ForumCategory } from '@/app/types/forum';
import NewThreadForm from '@/app/components/forum/NewThreadForm';

const translations = {
  uk: {
    forum: 'Форум',
    newThread: 'Створити нову тему',
    loading: 'Завантаження...',
    inCategory: 'в категорії',
    description: 'Заповніть форму нижче, щоб створити нову тему для обговорення'
  },
  en: {
    forum: 'Forum',
    newThread: 'Create New Thread',
    loading: 'Loading...',
    inCategory: 'in category',
    description: 'Fill out the form below to create a new discussion thread'
  }
};

export default function NewThreadPage() {
  const { lang } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const t = translations[lang];

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      try {
        const categoryData = await getForumCategoryBySlug(slug);
        setCategory(categoryData);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategory();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400 text-2xl">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400 text-2xl">Category not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/forum" className="text-green-500 hover:text-green-400 transition-colors">
              {t.forum}
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/forum/${category.slug}`}
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              {lang === 'uk' ? category.name_uk : category.name_en}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{t.newThread}</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-3">{t.newThread}</h1>
            <p className="text-gray-400 text-lg mb-2">
              {t.inCategory}: <span className="text-white font-semibold">
                {lang === 'uk' ? category.name_uk : category.name_en}
              </span>
            </p>
            <p className="text-gray-500">
              {t.description}
            </p>
          </div>

          {/* New Thread Form */}
          <NewThreadForm categoryId={category.id} categorySlug={category.slug} />
        </div>
      </main>
    </div>
  );
}