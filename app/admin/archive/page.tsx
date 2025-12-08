'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Додати до архіву',
    mediaType: 'Тип медіа',
    pdf: 'PDF документ',
    video: 'Відео',
    audio: 'Аудіо',
    image: 'Зображення',
    titleField: 'Назва',
    titlePlaceholder: 'Введіть назву...',
    descriptionField: 'Опис',
    descriptionPlaceholder: 'Введіть опис...',
    category: 'Категорія',
    selectCategory: 'Виберіть категорію',
    coverImage: 'Обкладинка',
    uploadCover: 'Завантажити обкладинку',
    pdfFile: 'PDF файл',
    uploadPdf: 'Завантажити PDF',
    videoFile: 'Відео файл',
    uploadVideo: 'Завантажити відео',
    audioFile: 'Аудіо файл',
    uploadAudio: 'Завантажити аудіо',
    imageFile: 'Зображення',
    uploadImage: 'Завантажити зображення',
    cancel: 'Скасувати',
    save: 'Зберегти',
    uploading: 'Завантаження...',
    errorTitle: 'Будь ласка, введіть назву',
    errorCategory: 'Будь ласка, виберіть категорію',
    errorFile: 'Будь ласка, завантажте файл',
    errorCover: 'Будь ласка, завантажте обкладинку',
    supportedFormats: 'Підтримувані формати',
    pdfFormats: 'PDF',
    videoFormats: 'MP4, WebM, MOV',
    audioFormats: 'MP3, WAV, OGG',
    imageFormats: 'JPG, PNG, WebP, GIF',
    maxSize: 'Макс. розмір'
  },
  en: {
    title: 'Add to Archive',
    mediaType: 'Media Type',
    pdf: 'PDF Document',
    video: 'Video',
    audio: 'Audio',
    image: 'Image',
    titleField: 'Title',
    titlePlaceholder: 'Enter title...',
    descriptionField: 'Description',
    descriptionPlaceholder: 'Enter description...',
    category: 'Category',
    selectCategory: 'Select category',
    coverImage: 'Cover Image',
    uploadCover: 'Upload cover',
    pdfFile: 'PDF File',
    uploadPdf: 'Upload PDF',
    videoFile: 'Video File',
    uploadVideo: 'Upload video',
    audioFile: 'Audio File',
    uploadAudio: 'Upload audio',
    imageFile: 'Image',
    uploadImage: 'Upload image',
    cancel: 'Cancel',
    save: 'Save',
    uploading: 'Uploading...',
    errorTitle: 'Please enter a title',
    errorCategory: 'Please select a category',
    errorFile: 'Please upload a file',
    errorCover: 'Please upload a cover image',
    supportedFormats: 'Supported formats',
    pdfFormats: 'PDF',
    videoFormats: 'MP4, WebM, MOV',
    audioFormats: 'MP3, WAV, OGG',
    imageFormats: 'JPG, PNG, WebP, GIF',
    maxSize: 'Max size'
  }
};

type MediaType = 'pdf' | 'video' | 'audio' | 'image';

export default function AdminArchiveUploadPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const [mediaType, setMediaType] = useState<MediaType>('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('archive_categories')
      .select('*')
      .order('name_uk');
    
    if (data) setCategories(data);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      
      // Create preview for images
      if (mediaType === 'image') {
        setMediaPreview(URL.createObjectURL(file));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate
    if (!title.trim()) {
      alert(t.errorTitle);
      return;
    }

    if (!category) {
      alert(t.errorCategory);
      return;
    }

    if (!mediaFile) {
      alert(t.errorFile);
      return;
    }

    // For videos and audios, cover image is required
    if ((mediaType === 'video' || mediaType === 'audio') && !coverImage) {
      alert(t.errorCover);
      return;
    }

    setUploading(true);

    try {
      console.log('🚀 Starting upload...');
      console.log('Media type:', mediaType);
      console.log('File:', mediaFile.name);
      let coverUrl = '';
      let mediaUrl = '';
      let thumbnailUrl = '';

      // Upload cover image (for all types except when image is the main file)
      if (coverImage && mediaType !== 'image') {
        console.log('📸 Uploading cover image...');
        const coverExt = coverImage.name.split('.').pop();
        const coverPath = `${Date.now()}_cover.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('archive-images')
          .upload(coverPath, coverImage);

        if (coverError) {
          console.error('❌ Cover upload failed:', coverError);
          throw coverError;
        }

        const { data: coverData } = supabase.storage
          .from('archive-images')
          .getPublicUrl(coverPath);
        
        coverUrl = coverData.publicUrl;
        thumbnailUrl = coverData.publicUrl;
        console.log('✅ Cover uploaded:', coverUrl);
      }

      // Upload main media file
      console.log('📤 Uploading main file...');
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      let bucket = '';
      switch (mediaType) {
        case 'pdf':
          bucket = 'archive-documents';
          break;
        case 'video':
          bucket = 'archive-videos';
          break;
        case 'audio':
          bucket = 'archive-audios';
          break;
        case 'image':
          bucket = 'archive-images';
          break;
      }

      console.log('📦 Uploading to bucket:', bucket);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, mediaFile);

      if (uploadError) {
        console.error('❌ File upload failed:', uploadError);
        throw uploadError;
      }

      const { data: fileData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      mediaUrl = fileData.publicUrl;
      console.log('✅ File uploaded:', mediaUrl);

      // For images used as main content, use it as both media and cover
      if (mediaType === 'image') {
        coverUrl = mediaUrl;
        thumbnailUrl = mediaUrl;
      }

      // Get file size
      const fileSize = mediaFile.size;

      // For videos/audios, you might want to get duration
      // This requires additional processing - simplified here
      let duration = null;
      if (mediaType === 'video' || mediaType === 'audio') {
        // You can add duration extraction here using a library
        // For now, we'll leave it as null
      }

      console.log('💾 Saving to database...');

      // Insert into database
      const { error: dbError } = await supabase
        .from('archive_documents')
        .insert({
          title_uk: title.trim(),
          title_en: title.trim(), // You can add separate EN field
          description_uk: description.trim(),
          description_en: description.trim(), // You can add separate EN field
          category_id: category,
          cover_image_url: coverUrl,
          pdf_url: mediaType === 'pdf' ? mediaUrl : null,
          media_type: mediaType,
          media_url: mediaType !== 'pdf' ? mediaUrl : null,
          thumbnail_url: thumbnailUrl,
          file_size: fileSize,
          duration: duration
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Success! Show message and redirect
      alert('Успішно завантажено!');
      
      // Small delay to ensure alert is seen
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to archive admin page
      window.location.href = '/admin/archive';

    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Помилка: ' + error.message);
      setUploading(false);
    }
  }

  if (uploading) {
    return <LoadingSpinner message={t.uploading} />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Type Selection */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-3">{t.mediaType}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['pdf', 'video', 'audio', 'image'] as MediaType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMediaType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mediaType === type
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {type === 'pdf' && '📄'}
                    {type === 'video' && '🎬'}
                    {type === 'audio' && '🎵'}
                    {type === 'image' && '🖼️'}
                  </div>
                  <div className="text-sm font-semibold">
                    {t[type]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.titleField}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.descriptionField}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={4}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">{t.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {lang === 'uk' ? cat.name_uk : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image (for video, audio, and PDF) */}
          {mediaType !== 'image' && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t.coverImage}
                {(mediaType === 'video' || mediaType === 'audio') && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="block w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="max-h-48 mx-auto rounded"
                  />
                ) : (
                  <>
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-gray-400">{t.uploadCover}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {t.supportedFormats}: {t.imageFormats}
                    </div>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Main Media File */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {mediaType === 'pdf' && t.pdfFile}
              {mediaType === 'video' && t.videoFile}
              {mediaType === 'audio' && t.audioFile}
              {mediaType === 'image' && t.imageFile}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="file"
              accept={
                mediaType === 'pdf' ? '.pdf' :
                mediaType === 'video' ? 'video/*' :
                mediaType === 'audio' ? 'audio/*' :
                'image/*'
              }
              onChange={handleMediaChange}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="block w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
            >
              {mediaFile ? (
                <div>
                  {mediaType === 'image' && mediaPreview ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded mb-4"
                    />
                  ) : (
                    <div className="text-4xl mb-2">
                      {mediaType === 'pdf' && '📄'}
                      {mediaType === 'video' && '🎬'}
                      {mediaType === 'audio' && '🎵'}
                      {mediaType === 'image' && '🖼️'}
                    </div>
                  )}
                  <div className="text-green-500 font-semibold">
                    {mediaFile.name}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-2">
                    {mediaType === 'pdf' && '📄'}
                    {mediaType === 'video' && '🎬'}
                    {mediaType === 'audio' && '🎵'}
                    {mediaType === 'image' && '🖼️'}
                  </div>
                  <div className="text-gray-400">
                    {mediaType === 'pdf' && t.uploadPdf}
                    {mediaType === 'video' && t.uploadVideo}
                    {mediaType === 'audio' && t.uploadAudio}
                    {mediaType === 'image' && t.uploadImage}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {t.supportedFormats}: {
                      mediaType === 'pdf' ? t.pdfFormats :
                      mediaType === 'video' ? t.videoFormats :
                      mediaType === 'audio' ? t.audioFormats :
                      t.imageFormats
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.maxSize}: {
                      mediaType === 'pdf' ? '50 MB' :
                      mediaType === 'video' ? '500 MB' :
                      mediaType === 'audio' ? '100 MB' :
                      '10 MB'
                    }
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/archive')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-lg font-bold transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}