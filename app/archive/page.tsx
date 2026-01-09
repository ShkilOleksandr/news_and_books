'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Архів',
    search: 'Пошук...',
    allCategories: 'Всі категорії',
    noDocuments: 'Немає документів',
    views: 'переглядів',
    downloads: 'завантажень',
    view: 'Переглянути',
    download: 'Завантажити',
    play: 'Відтворити',
    listen: 'Прослухати',
    duration: 'Тривалість',
    fileSize: 'Розмір файлу',
    delete: 'Видалити',
    confirmDelete: 'Ви впевнені, що хочете видалити цей елемент?',
    deleted: 'Елемент видалено',
    errorDeleting: 'Помилка при видаленні'
  },
  en: {
    title: 'Archive',
    search: 'Search...',
    allCategories: 'All Categories',
    noDocuments: 'No documents',
    views: 'views',
    downloads: 'downloads',
    view: 'View',
    download: 'Download',
    play: 'Play',
    listen: 'Listen',
    duration: 'Duration',
    fileSize: 'File Size',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',
    deleted: 'Item deleted',
    errorDeleting: 'Error deleting'
  }
};

type Document = {
  id: number;
  title_uk: string;
  title_en: string;
  description_uk: string;
  description_en: string;
  cover_image_url: string;
  pdf_url: string | null;
  media_type: 'pdf' | 'video' | 'audio' | 'image';
  media_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  file_size: number | null;
  view_count: number;
  download_count: number;
  category: {
    id: number;
    name_uk: string;
    name_en: string;
  } | null;
};

// HARDCODED ADMIN EMAIL
const ADMIN_EMAIL = 'romanewsukraine@gmail.com';

export default function ArchivePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Document | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    checkAdmin();
  }, []);

  useEffect(() => {
    loadCategories();
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [selectedCategory, searchQuery, allDocuments]);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // HARDCODED: Check if user email is admin email
    const isAdminUser = user.email === ADMIN_EMAIL;
    
    console.log('🔍 User email:', user.email);
    console.log('🔍 Admin email:', ADMIN_EMAIL);
    console.log('✅ Is admin:', isAdminUser);
    
    setIsAdmin(isAdminUser);
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('archive_categories')
      .select('*')
      .order('name_uk');
    
    if (data) setCategories(data);
  }

  async function loadDocuments() {
    const { data } = await supabase
      .from('archive_documents')
      .select(`
        *,
        category:archive_categories(id, name_uk, name_en)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      setAllDocuments(data as any);
      setDocuments(data as any);
    }
    setLoading(false);
  }

  function filterDocuments() {
    let filtered = allDocuments;

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category?.id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => {
        const title = (lang === 'uk' ? doc.title_uk : doc.title_en).toLowerCase();
        const description = (lang === 'uk' ? doc.description_uk : doc.description_en).toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    setDocuments(filtered);
  }

  async function handleDelete(docId: number) {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    setDeleting(docId);

    try {
      const { error } = await supabase
        .from('archive_documents')
        .delete()
        .eq('id', docId);

      if (error) {
        throw error;
      }

      setAllDocuments(allDocuments.filter(doc => doc.id !== docId));
      setDocuments(documents.filter(doc => doc.id !== docId));
      alert(t.deleted);
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(t.errorDeleting + ': ' + error.message);
    } finally {
      setDeleting(null);
    }
  }

  async function incrementViewCount(docId: number) {
    await supabase.rpc('increment_archive_view_count', { doc_id: docId });
  }

  async function incrementDownloadCount(docId: number) {
    await supabase.rpc('increment_archive_download_count', { doc_id: docId });
  }

  function formatFileSize(bytes: number | null) {
    if (!mounted || !bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return Math.round(gb * 10) / 10 + ' GB';
    if (mb >= 1) return Math.round(mb * 10) / 10 + ' MB';
    if (kb >= 1) return Math.round(kb * 10) / 10 + ' KB';
    return bytes + ' B';
  }

  function formatDuration(seconds: number | null) {
    if (!mounted || !seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function handleView(doc: Document) {
    incrementViewCount(doc.id);
    if (doc.media_type === 'pdf') {
      window.open(doc.pdf_url!, '_blank');
    } else {
      setSelectedMedia(doc);
    }
  }

  function handleDownload(doc: Document) {
    incrementDownloadCount(doc.id);
    const url = doc.media_type === 'pdf' ? doc.pdf_url : doc.media_url;
    if (url) window.open(url, '_blank');
  }

  if (loading || !mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              selectedCategory === null
                ? 'bg-green-500 text-black'
                : 'bg-gray-900 text-white border border-gray-800 hover:bg-gray-800'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-900 text-white border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {lang === 'uk' ? cat.name_uk : cat.name_en}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center text-gray-400 py-20">{t.noDocuments}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500 transition-all group"
              >
                <div className="relative aspect-video bg-gray-800 overflow-hidden">
                  {(doc.cover_image_url || doc.thumbnail_url) ? (
                    <img
                      src={(doc.cover_image_url || doc.thumbnail_url) || ''}
                      alt={lang === 'uk' ? doc.title_uk : doc.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {doc.media_type === 'pdf' && '📄'}
                      {doc.media_type === 'video' && '🎬'}
                      {doc.media_type === 'audio' && '🎵'}
                      {doc.media_type === 'image' && '🖼️'}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {doc.media_type === 'pdf' && '📄'}
                    {doc.media_type === 'video' && '🎬'}
                    {doc.media_type === 'audio' && '🎵'}
                    {doc.media_type === 'image' && '🖼️'}
                    <span className="uppercase">{doc.media_type}</span>
                  </div>
                  {doc.duration && (
                    <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                      {formatDuration(doc.duration)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {doc.category && (
                    <div className="text-xs text-green-500 font-semibold mb-2 uppercase">
                      {lang === 'uk' ? doc.category.name_uk : doc.category.name_en}
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {lang === 'uk' ? doc.title_uk : doc.title_en}
                  </h3>
                  {(doc.description_uk || doc.description_en) && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {lang === 'uk' ? doc.description_uk : doc.description_en}
                    </p>
                  )}
                  {doc.file_size && (
                    <div className="text-xs text-gray-500 mb-3">
                      {t.fileSize}: {formatFileSize(doc.file_size)}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>👁️ {doc.view_count} {t.views}</span>
                    <span>⬇️ {doc.download_count} {t.downloads}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-black px-4 py-3 rounded-lg font-bold transition-colors"
                    >
                      {doc.media_type === 'pdf' && t.view}
                      {doc.media_type === 'video' && t.play}
                      {doc.media_type === 'audio' && t.listen}
                      {doc.media_type === 'image' && t.view}
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                    >
                      ⬇️
                    </button>
                    
                    {/* DELETE BUTTON - Shows only for hardcoded admin email */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                        title={t.delete}
                      >
                        {deleting === doc.id ? '⏳' : '🗑️'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-6xl w-full bg-gray-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {lang === 'uk' ? selectedMedia.title_uk : selectedMedia.title_en}
              </h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {selectedMedia.media_type === 'video' && selectedMedia.media_url && (
                <video controls autoPlay className="w-full rounded-lg" src={selectedMedia.media_url}>
                  Your browser does not support the video tag.
                </video>
              )}

              {selectedMedia.media_type === 'audio' && selectedMedia.media_url && (
                <div className="flex flex-col items-center py-12">
                  {selectedMedia.cover_image_url && (
                    <img
                      src={selectedMedia.cover_image_url}
                      alt="Cover"
                      className="w-64 h-64 object-cover rounded-xl mb-6"
                    />
                  )}
                  <audio controls autoPlay className="w-full max-w-2xl" src={selectedMedia.media_url}>
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}

              {selectedMedia.media_type === 'image' && selectedMedia.media_url && (
                <img
                  src={selectedMedia.media_url}
                  alt={lang === 'uk' ? selectedMedia.title_uk : selectedMedia.title_en}
                  className="w-full rounded-lg"
                />
              )}

              {(selectedMedia.description_uk || selectedMedia.description_en) && (
                <div className="mt-6 text-gray-300">
                  {lang === 'uk' ? selectedMedia.description_uk : selectedMedia.description_en}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedMedia.file_size && (
                  <span className="mr-4">
                    {t.fileSize}: {formatFileSize(selectedMedia.file_size)}
                  </span>
                )}
                {selectedMedia.duration && (
                  <span>
                    {t.duration}: {formatDuration(selectedMedia.duration)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDownload(selectedMedia)}
                className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
              >
                {t.download}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}