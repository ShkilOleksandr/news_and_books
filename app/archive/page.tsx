'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import type { ArchiveDocument, ArchiveCategory } from '@/app/types/archive';
import Link from 'next/link';

const translations = {
  uk: {
    title: 'Архів',
    allCategories: 'Всі категорії',
    featured: 'Відзначені',
    search: 'Пошук...',
    noDocuments: 'Документів не знайдено',
    author: 'Автор',
    publicationDate: 'Дата',
    views: 'переглядів',
    downloads: 'завантажень',
    download: 'Завантажити',
    readMore: 'Читати більше',
    loading: 'Завантаження...'
  },
  en: {
    title: 'Archive',
    allCategories: 'All Categories',
    featured: 'Featured',
    search: 'Search...',
    noDocuments: 'No documents found',
    author: 'Author',
    publicationDate: 'Date',
    views: 'views',
    downloads: 'downloads',
    download: 'Download',
    readMore: 'Read more',
    loading: 'Loading...'
  }
};

export default function ArchivePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadDocuments();
  }, [selectedCategory]);

  async function loadCategories() {
    const { data } = await supabase
      .from('archive_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
  }

  async function loadDocuments() {
    setLoading(true);
    
    let query = supabase
      .from('archive_documents')
      .select(`
        *,
        category:archive_categories(*)
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;

    if (data) {
      setDocuments(data);
    }
    setLoading(false);
  }

  async function handleDownload(doc: ArchiveDocument) {
    if (!doc.document_url) return;

    // Increment download count
    await supabase.rpc('increment_document_downloads', { document_id: doc.id });

    // Open document in new tab
    window.open(doc.document_url, '_blank');
  }

  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title_uk.toLowerCase().includes(query) ||
      doc.title_en.toLowerCase().includes(query) ||
      doc.description_uk?.toLowerCase().includes(query) ||
      doc.description_en?.toLowerCase().includes(query) ||
      doc.author?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-6">{t.title}</h1>
            
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-6 py-3 text-lg focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 flex-wrap">
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
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-gray-400 text-2xl py-20">
              {t.loading}
            </div>
          )}

          {/* Documents Grid */}
          {!loading && filteredDocuments.length === 0 && (
            <div className="text-center text-gray-400 text-2xl py-20">
              {t.noDocuments}
            </div>
          )}

          {!loading && filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors group"
                >
                  {/* Image */}
                  {doc.image_url && (
                    <div className="relative h-48 bg-gray-800 overflow-hidden">
                      <img
                        src={doc.image_url}
                        alt={lang === 'uk' ? doc.title_uk : doc.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {doc.is_featured && (
                        <div className="absolute top-3 right-3 bg-green-500 text-black px-3 py-1 rounded-lg text-sm font-bold">
                          ⭐ {t.featured}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    {doc.category && (
                      <div className="mb-3">
                        <span className="bg-gray-800 text-green-500 text-xs font-bold px-3 py-1 rounded-full">
                          {lang === 'uk' ? doc.category.name_uk : doc.category.name_en}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-green-500 transition-colors">
                      {lang === 'uk' ? doc.title_uk : doc.title_en}
                    </h3>

                    {/* Description */}
                    {(doc.description_uk || doc.description_en) && (
                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {lang === 'uk' ? doc.description_uk : doc.description_en}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="mb-4 space-y-1 text-sm text-gray-500">
                      {doc.author && (
                        <div>{t.author}: {doc.author}</div>
                      )}
                      {doc.publication_date && (
                        <div>{t.publicationDate}: {new Date(doc.publication_date).toLocaleDateString()}</div>
                      )}
                      <div className="flex gap-4">
                        <span>{doc.view_count} {t.views}</span>
                        <span>{doc.download_count} {t.downloads}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    {doc.document_url && (
                      <button
                        onClick={() => handleDownload(doc)}
                        className="w-full bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
                      >
                        {t.download}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}