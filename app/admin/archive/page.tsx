'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import type { ArchiveDocument, ArchiveCategory } from '@/app/types/archive';

const translations = {
  uk: {
    title: 'Управління архівом',
    addDocument: '+ Додати документ',
    titleUk: 'Назва (Українською)',
    titleEn: 'Назва (Англійською)',
    descriptionUk: 'Опис (Українською)',
    descriptionEn: 'Опис (Англійською)',
    category: 'Категорія',
    selectCategory: 'Оберіть категорію',
    author: 'Автор',
    publicationDate: 'Дата публікації',
    document: 'Документ',
    uploadDocument: 'Завантажити документ',
    image: 'Зображення (обкладинка)',
    uploadImage: 'Завантажити зображення',
    featured: 'Відзначений',
    save: 'Зберегти',
    cancel: 'Скасувати',
    edit: 'Редагувати',
    delete: 'Видалити',
    views: 'переглядів',
    downloads: 'завантажень',
    confirmDelete: 'Ви впевнені, що хочете видалити цей документ?',
    creating: 'Створення...',
    updating: 'Оновлення...',
    uploadingDocument: 'Завантаження документа...',
    uploadingImage: 'Завантаження зображення...',
    errorTitle: 'Будь ласка, введіть назву українською',
    errorUploading: 'Помилка завантаження файлу',
    successCreated: 'Документ успішно створено',
    successUpdated: 'Документ успішно оновлено',
    successDeleted: 'Документ успішно видалено'
  },
  en: {
    title: 'Manage Archive',
    addDocument: '+ Add Document',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    descriptionUk: 'Description (Ukrainian)',
    descriptionEn: 'Description (English)',
    category: 'Category',
    selectCategory: 'Select category',
    author: 'Author',
    publicationDate: 'Publication Date',
    document: 'Document',
    uploadDocument: 'Upload document',
    image: 'Image (cover)',
    uploadImage: 'Upload image',
    featured: 'Featured',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    views: 'views',
    downloads: 'downloads',
    confirmDelete: 'Are you sure you want to delete this document?',
    creating: 'Creating...',
    updating: 'Updating...',
    uploadingDocument: 'Uploading document...',
    uploadingImage: 'Uploading image...',
    errorTitle: 'Please enter a title in Ukrainian',
    errorUploading: 'Error uploading file',
    successCreated: 'Document created successfully',
    successUpdated: 'Document updated successfully',
    successDeleted: 'Document deleted successfully'
  }
};

export default function AdminArchivePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ArchiveDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [titleUk, setTitleUk] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionUk, setDescriptionUk] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [author, setAuthor] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  async function loadDocuments() {
    const { data, error } = await supabase
      .from('archive_documents')
      .select(`
        *,
        category:archive_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('archive_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  }

  async function uploadDocument(file: File) {
    setUploadingDoc(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('archive-documents')
      .upload(filePath, file);

    setUploadingDoc(false);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('archive-documents')
      .getPublicUrl(filePath);

    return { url: publicUrl, filename: file.name, type: fileExt, size: file.size };
  }

  async function uploadImage(file: File) {
    setUploadingImg(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('archive-images')
      .upload(filePath, file);

    setUploadingImg(false);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('archive-images')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!titleUk.trim()) {
      setMessage(t.errorTitle);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalDocUrl = documentUrl;
      let finalDocFilename = '';
      let finalDocType = '';
      let finalFileSize = 0;

      // Upload document if new file selected
      if (documentFile) {
        const uploadResult = await uploadDocument(documentFile);
        if (!uploadResult) {
          setMessage(t.errorUploading);
          setLoading(false);
          return;
        }
        finalDocUrl = uploadResult.url;
        finalDocFilename = uploadResult.filename;
        finalDocType = uploadResult.type || '';
        finalFileSize = uploadResult.size;
      }

      let finalImageUrl = imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        if (!uploadedImageUrl) {
          setMessage(t.errorUploading);
          setLoading(false);
          return;
        }
        finalImageUrl = uploadedImageUrl;
      }

      const documentData = {
        category_id: categoryId,
        title_uk: titleUk.trim(),
        title_en: titleEn.trim() || titleUk.trim(),
        description_uk: descriptionUk.trim() || null,
        description_en: descriptionEn.trim() || null,
        document_url: finalDocUrl || null,
        document_filename: finalDocFilename || null,
        document_type: finalDocType || null,
        image_url: finalImageUrl || null,
        author: author.trim() || null,
        publication_date: publicationDate || null,
        file_size: finalFileSize || null,
        uploaded_by: user.id,
        is_featured: isFeatured,
      };

      if (editingDocument) {
        // Update existing document
        const { error } = await supabase
          .from('archive_documents')
          .update(documentData)
          .eq('id', editingDocument.id);

        if (error) throw error;
        setMessage(t.successUpdated);
      } else {
        // Create new document
        const { error } = await supabase
          .from('archive_documents')
          .insert([documentData]);

        if (error) throw error;
        setMessage(t.successCreated);
      }

      // Reset form
      resetForm();
      loadDocuments();
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitleUk('');
    setTitleEn('');
    setDescriptionUk('');
    setDescriptionEn('');
    setCategoryId(null);
    setAuthor('');
    setPublicationDate('');
    setIsFeatured(false);
    setDocumentFile(null);
    setImageFile(null);
    setDocumentUrl('');
    setImageUrl('');
    setEditingDocument(null);
  }

  function handleEdit(doc: ArchiveDocument) {
    setEditingDocument(doc);
    setTitleUk(doc.title_uk);
    setTitleEn(doc.title_en);
    setDescriptionUk(doc.description_uk || '');
    setDescriptionEn(doc.description_en || '');
    setCategoryId(doc.category_id);
    setAuthor(doc.author || '');
    setPublicationDate(doc.publication_date || '');
    setIsFeatured(doc.is_featured);
    setDocumentUrl(doc.document_url || '');
    setImageUrl(doc.image_url || '');
    setIsFormOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm(t.confirmDelete)) return;

    const { error } = await supabase
      .from('archive_documents')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage(t.successDeleted);
      loadDocuments();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
          >
            {t.addDocument}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-blue-400">{message}</p>
          </div>
        )}

        {/* Form */}
        {isFormOpen && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Title UK */}
                <div>
                  <label className="block text-sm font-bold mb-2">{t.titleUk} *</label>
                  <input
                    type="text"
                    value={titleUk}
                    onChange={(e) => setTitleUk(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                {/* Title EN */}
                <div>
                  <label className="block text-sm font-bold mb-2">{t.titleEn}</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Description UK */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.descriptionUk}</label>
                <textarea
                  value={descriptionUk}
                  onChange={(e) => setDescriptionUk(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.descriptionEn}</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-bold mb-2">{t.category}</label>
                  <select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(Number(e.target.value) || null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  >
                    <option value="">{t.selectCategory}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {lang === 'uk' ? cat.name_uk : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-bold mb-2">{t.author}</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Publication Date */}
                <div>
                  <label className="block text-sm font-bold mb-2">{t.publicationDate}</label>
                  <input
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.document}</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
                {uploadingDoc && <p className="text-green-500 mt-2">{t.uploadingDocument}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.image}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
                {uploadingImg && <p className="text-green-500 mt-2">{t.uploadingImage}</p>}
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="mt-4 max-w-xs rounded-lg" />
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="featured" className="text-sm font-bold">
                  {t.featured}
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || uploadingDoc || uploadingImg}
                  className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? (editingDocument ? t.updating : t.creating) : t.save}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex gap-6">
              {/* Image */}
              {doc.image_url && (
                <img
                  src={doc.image_url}
                  alt={doc.title_uk}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{lang === 'uk' ? doc.title_uk : doc.title_en}</h3>
                {doc.description_uk && (
                  <p className="text-gray-400 mb-3 line-clamp-2">
                    {lang === 'uk' ? doc.description_uk : doc.description_en}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {doc.author && <span>Автор: {doc.author}</span>}
                  {doc.publication_date && <span>{new Date(doc.publication_date).toLocaleDateString()}</span>}
                  <span>{doc.view_count} {t.views}</span>
                  <span>{doc.download_count} {t.downloads}</span>
                  {doc.is_featured && <span className="text-green-500">⭐ Featured</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(doc)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  {t.edit}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}