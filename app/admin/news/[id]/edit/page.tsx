'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';

const translations = {
  uk: {
    editArticle: 'Редагувати статтю',
    backToDashboard: 'Назад до панелі',
    contentType: 'Тип контенту',
    contentTypeText: 'Текст (HTML)',
    contentTypePdf: 'PDF документ',
    titleUk: 'Заголовок (Українська)',
    titleEn: 'Заголовок (English)',
    excerptUk: 'Короткий опис (Українська)',
    excerptEn: 'Короткий опис (English)',
    contentUk: 'Контент (Українська)',
    contentEn: 'Контент (English)',
    pdfFileUk: 'PDF файл (Українська)',
    pdfFileEn: 'PDF файл (English)',
    categoryUk: 'Категорія (Українська)',
    categoryEn: 'Категорія (English)',
    authorUk: 'Автор (Українська)',
    authorEn: 'Автор (English)',
    authorBioUk: 'Біографія автора (Українська)',
    authorBioEn: 'Біографія автора (English)',
    authorImage: 'Фото автора (URL)',
    imageUrl: 'URL зображення',
    readTime: 'Час читання (хвилин)',
    featured: 'Обране',
    save: 'Зберегти',
    saving: 'Збереження...',
    uploading: 'Завантаження...',
    required: "Обов'язкове поле",
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Оберіть категорію',
    loading: 'Завантаження...',
    checkAuth: 'Перевірка авторізації...',
    notFound: 'Статтю не знайдено',
    cancel: 'Скасувати',
    chooseFile: 'Оберіть файл',
    fileSelected: 'Файл обрано',
    uploadError: 'Помилка завантаження файлу',
    pdfOnly: 'Тільки PDF файли',
    maxFileSize: 'Максимальний розмір: 10MB',
    remove: 'Видалити',
    currentPdf: 'Поточний PDF',
    replaceFile: 'Замінити файл',
    keepCurrent: 'Залишити поточний',
    htmlSupported: 'HTML теги підтримуються: <p>, <h2>, <strong>, тощо'
  },
  en: {
    editArticle: 'Edit Article',
    backToDashboard: 'Back to Dashboard',
    contentType: 'Content Type',
    contentTypeText: 'Text (HTML)',
    contentTypePdf: 'PDF Document',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    excerptUk: 'Excerpt (Ukrainian)',
    excerptEn: 'Excerpt (English)',
    contentUk: 'Content (Ukrainian)',
    contentEn: 'Content (English)',
    pdfFileUk: 'PDF File (Ukrainian)',
    pdfFileEn: 'PDF File (English)',
    categoryUk: 'Category (Ukrainian)',
    categoryEn: 'Category (English)',
    authorUk: 'Author (Ukrainian)',
    authorEn: 'Author (English)',
    authorBioUk: 'Author Bio (Ukrainian)',
    authorBioEn: 'Author Bio (English)',
    authorImage: 'Author Photo (URL)',
    imageUrl: 'Image URL',
    readTime: 'Read Time (minutes)',
    featured: 'Featured',
    save: 'Save Changes',
    saving: 'Saving...',
    uploading: 'Uploading...',
    required: 'Required field',
    imagePlaceholder: 'https://images.unsplash.com/photo-...',
    selectCategory: 'Select category',
    loading: 'Loading...',
    checkAuth: 'Checking authentication...',
    notFound: 'Article not found',
    cancel: 'Cancel',
    chooseFile: 'Choose file',
    fileSelected: 'File selected',
    uploadError: 'File upload error',
    pdfOnly: 'PDF files only',
    maxFileSize: 'Max size: 10MB',
    remove: 'Remove',
    currentPdf: 'Current PDF',
    replaceFile: 'Replace file',
    keepCurrent: 'Keep current',
    htmlSupported: 'HTML tags supported: <p>, <h2>, <strong>, etc'
  }
};

const categories = {
  uk: ['Технології', 'Екологія', 'Бізнес', 'Культура', 'Спорт', 'Здоров\'я'],
  en: ['Technology', 'Environment', 'Business', 'Culture', 'Sports', 'Health']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type NewsItem = {
  id: number;
  content_type: 'text' | 'pdf';
  title_uk: string;
  title_en: string;
  excerpt_uk: string;
  excerpt_en: string;
  content_uk: string;
  content_en: string;
  pdf_url_uk?: string;
  pdf_url_en?: string;
  category_uk: string;
  category_en: string;
  author_uk: string;
  author_en: string;
  author_bio_uk: string;
  author_bio_en: string;
  author_image: string;
  main_image: string | null;
  read_time: number;
  featured: boolean;
};

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [articleId, setArticleId] = useState<string>('');
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingUk, setUploadingUk] = useState(false);
  const [uploadingEn, setUploadingEn] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const pdfInputUkRef = useRef<HTMLInputElement>(null);
  const pdfInputEnRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<NewsItem>({
    id: 0,
    content_type: 'text',
    title_uk: '',
    title_en: '',
    excerpt_uk: '',
    excerpt_en: '',
    content_uk: '',
    content_en: '',
    pdf_url_uk: '',
    pdf_url_en: '',
    category_uk: '',
    category_en: '',
    author_uk: '',
    author_en: '',
    author_bio_uk: '',
    author_bio_en: '',
    author_image: '',
    main_image: '',
    read_time: 5,
    featured: false
  });

  const [newPdfFiles, setNewPdfFiles] = useState({
    uk: null as File | null,
    en: null as File | null
  });

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setArticleId(resolvedParams.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setFormData({
        ...data,
        content_type: data.content_type || 'text'
      });
      setLoading(false);
    }

    init();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex;
    if (selectedIndex > 0) {
      setFormData(prev => ({
        ...prev,
        category_uk: categories.uk[selectedIndex - 1],
        category_en: categories.en[selectedIndex - 1]
      }));
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>, language: 'uk' | 'en') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError(t.pdfOnly);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`${t.maxFileSize} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setError('');
    setNewPdfFiles(prev => ({ ...prev, [language]: file }));
  };

  const removePdfFile = (language: 'uk' | 'en') => {
    setNewPdfFiles(prev => ({ ...prev, [language]: null }));
    if (language === 'uk' && pdfInputUkRef.current) {
      pdfInputUkRef.current.value = '';
    } else if (language === 'en' && pdfInputEnRef.current) {
      pdfInputEnRef.current.value = '';
    }
  };

  const uploadPdfFile = async (file: File, language: 'uk' | 'en'): Promise<string> => {
    const fileExt = 'pdf';
    const fileName = `${Date.now()}-${language}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('article-pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('article-pdfs')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!formData.title_uk || !formData.title_en) {
        setError(t.required);
        setSubmitting(false);
        return;
      }

      // Validate based on content type
      if (formData.content_type === 'text') {
        if (!formData.content_uk || !formData.content_en) {
          setError(t.required);
          setSubmitting(false);
          return;
        }
      } else if (formData.content_type === 'pdf') {
        // For PDF, check if we have existing URLs or new files
        if (!formData.pdf_url_uk && !newPdfFiles.uk) {
          setError(t.required + ' (Ukrainian PDF)');
          setSubmitting(false);
          return;
        }
        if (!formData.pdf_url_en && !newPdfFiles.en) {
          setError(t.required + ' (English PDF)');
          setSubmitting(false);
          return;
        }
      }

      let pdfUrlUk = formData.pdf_url_uk || '';
      let pdfUrlEn = formData.pdf_url_en || '';

      // Upload new PDF files if provided
      if (formData.content_type === 'pdf') {
        if (newPdfFiles.uk) {
          setUploadingUk(true);
          pdfUrlUk = await uploadPdfFile(newPdfFiles.uk, 'uk');
          setUploadingUk(false);
        }

        if (newPdfFiles.en) {
          setUploadingEn(true);
          pdfUrlEn = await uploadPdfFile(newPdfFiles.en, 'en');
          setUploadingEn(false);
        }
      }

      const updateData: any = {
        content_type: formData.content_type,
        title_uk: formData.title_uk,
        title_en: formData.title_en,
        excerpt_uk: formData.excerpt_uk,
        excerpt_en: formData.excerpt_en,
        category_uk: formData.category_uk,
        category_en: formData.category_en,
        author_uk: formData.author_uk,
        author_en: formData.author_en,
        author_bio_uk: formData.author_bio_uk,
        author_bio_en: formData.author_bio_en,
        author_image: formData.author_image || null,
        main_image: formData.main_image || null,
        read_time: formData.read_time,
        featured: formData.featured,
        updated_at: new Date().toISOString()
      };

      if (formData.content_type === 'text') {
        updateData.content_uk = formData.content_uk;
        updateData.content_en = formData.content_en;
        updateData.pdf_url_uk = null;
        updateData.pdf_url_en = null;
      } else {
        updateData.content_uk = '';
        updateData.content_en = '';
        updateData.pdf_url_uk = pdfUrlUk;
        updateData.pdf_url_en = pdfUrlEn;
      }

      const { error: updateError } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', articleId);

      if (updateError) {
        throw updateError;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || t.uploadError);
      setSubmitting(false);
      setUploadingUk(false);
      setUploadingEn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t.notFound}</h1>
          <a href="/admin/dashboard" className="text-green-500 hover:text-green-400">
            {t.backToDashboard}
          </a>
        </div>
      </div>
    );
  }

  const currentCategoryIndex = categories.uk.indexOf(formData.category_uk);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <LogoTiles />
            </div>
            <span className="text-gray-400">{t.editArticle}</span>
          </div>
          
          <a
            href="/admin/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← {t.backToDashboard}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editArticle}</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selector */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.contentType} *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_type"
                  value="text"
                  checked={formData.content_type === 'text'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>{t.contentTypeText}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_type"
                  value="pdf"
                  checked={formData.content_type === 'pdf'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>{t.contentTypePdf}</span>
              </label>
            </div>
          </div>

          {/* Title Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.titleUk} *</label>
            <input
              type="text"
              name="title_uk"
              value={formData.title_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Title English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.titleEn} *</label>
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Excerpt Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.excerptUk}</label>
            <textarea
              name="excerpt_uk"
              value={formData.excerpt_uk}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Excerpt English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.excerptEn}</label>
            <textarea
              name="excerpt_en"
              value={formData.excerpt_en}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Conditional Content Fields */}
          {formData.content_type === 'text' ? (
            <>
              {/* Content Ukrainian */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.contentUk} *</label>
                <textarea
                  name="content_uk"
                  value={formData.content_uk}
                  onChange={handleChange}
                  rows={12}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">{t.htmlSupported}</p>
              </div>

              {/* Content English */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.contentEn} *</label>
                <textarea
                  name="content_en"
                  value={formData.content_en}
                  onChange={handleChange}
                  rows={12}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">{t.htmlSupported}</p>
              </div>
            </>
          ) : (
            <>
              {/* PDF Upload Ukrainian */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.pdfFileUk} *</label>
                <div className="space-y-3">
                  {/* Show current PDF if exists */}
                  {formData.pdf_url_uk && !newPdfFiles.uk && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-semibold">{t.currentPdf}</p>
                            <a href={formData.pdf_url_uk} target="_blank" rel="noopener noreferrer" className="text-sm text-green-500 hover:text-green-400">
                              {lang === 'uk' ? 'Переглянути' : 'View'}
                            </a>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{t.keepCurrent}</span>
                      </div>
                    </div>
                  )}

                  {/* File upload */}
                  <input
                    ref={pdfInputUkRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handlePdfFileChange(e, 'uk')}
                    className="hidden"
                    id="pdf-upload-uk"
                  />
                  <label
                    htmlFor="pdf-upload-uk"
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {newPdfFiles.uk ? t.fileSelected : (formData.pdf_url_uk ? t.replaceFile : t.chooseFile)}
                  </label>

                  {/* Show new file if selected */}
                  {newPdfFiles.uk && (
                    <div className="flex items-center justify-between bg-gray-900 border border-green-500 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold">{newPdfFiles.uk.name}</p>
                          <p className="text-sm text-gray-400">
                            {(newPdfFiles.uk.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePdfFile('uk')}
                        className="text-red-500 hover:text-red-400 font-semibold"
                      >
                        {t.remove}
                      </button>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-400">{t.maxFileSize}</p>
                </div>
              </div>

              {/* PDF Upload English */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.pdfFileEn} *</label>
                <div className="space-y-3">
                  {/* Show current PDF if exists */}
                  {formData.pdf_url_en && !newPdfFiles.en && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-semibold">{t.currentPdf}</p>
                            <a href={formData.pdf_url_en} target="_blank" rel="noopener noreferrer" className="text-sm text-green-500 hover:text-green-400">
                              {lang === 'uk' ? 'Переглянути' : 'View'}
                            </a>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{t.keepCurrent}</span>
                      </div>
                    </div>
                  )}

                  {/* File upload */}
                  <input
                    ref={pdfInputEnRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handlePdfFileChange(e, 'en')}
                    className="hidden"
                    id="pdf-upload-en"
                  />
                  <label
                    htmlFor="pdf-upload-en"
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {newPdfFiles.en ? t.fileSelected : (formData.pdf_url_en ? t.replaceFile : t.chooseFile)}
                  </label>

                  {/* Show new file if selected */}
                  {newPdfFiles.en && (
                    <div className="flex items-center justify-between bg-gray-900 border border-green-500 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold">{newPdfFiles.en.name}</p>
                          <p className="text-sm text-gray-400">
                            {(newPdfFiles.en.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePdfFile('en')}
                        className="text-red-500 hover:text-red-400 font-semibold"
                      >
                        {t.remove}
                      </button>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-400">{t.maxFileSize}</p>
                </div>
              </div>
            </>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.categoryUk} / {t.categoryEn}</label>
            <select
              value={currentCategoryIndex >= 0 ? currentCategoryIndex : ''}
              onChange={handleCategoryChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">{t.selectCategory}</option>
              {categories[lang].map((category, index) => (
                <option key={index} value={index}>
                  {category} / {categories[lang === 'uk' ? 'en' : 'uk'][index]}
                </option>
              ))}
            </select>
          </div>

          {/* Author Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorUk}</label>
            <input
              type="text"
              name="author_uk"
              value={formData.author_uk}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Author English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorEn}</label>
            <input
              type="text"
              name="author_en"
              value={formData.author_en}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Author Bio Ukrainian */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorBioUk}</label>
            <textarea
              name="author_bio_uk"
              value={formData.author_bio_uk || ''}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Author Bio English */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorBioEn}</label>
            <textarea
              name="author_bio_en"
              value={formData.author_bio_en || ''}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Author Image */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.authorImage}</label>
            <input
              type="url"
              name="author_image"
              value={formData.author_image || ''}
              onChange={handleChange}
              placeholder={t.imagePlaceholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
            {formData.author_image && (
              <div className="mt-4 rounded-full overflow-hidden w-20 h-20">
                <img 
                  src={formData.author_image} 
                  alt="Author preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Main Image URL */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.imageUrl}</label>
            <input
              type="url"
              name="main_image"
              value={formData.main_image || ''}
              onChange={handleChange}
              placeholder={t.imagePlaceholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
            {formData.main_image && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img 
                  src={formData.main_image} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.readTime}</label>
            <input
              type="number"
              name="read_time"
              value={formData.read_time}
              onChange={handleChange}
              min="1"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-5 h-5 bg-gray-900 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="featured" className="text-sm font-bold cursor-pointer">
              {t.featured}
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting || uploadingUk || uploadingEn}
              className="flex-1 bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(submitting || uploadingUk || uploadingEn) && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {uploadingUk || uploadingEn ? t.uploading : (submitting ? t.saving : t.save)}
            </button>
            
            <a
              href="/admin/dashboard"
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
            >
              {t.cancel}
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}