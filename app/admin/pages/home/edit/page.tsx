'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';
import ImageUpload from '@/app/components/ImageUpload';

const translations = {
  uk: {
    editHome: 'Редагувати головну сторінку',
    backToPages: 'Назад до сторінок',
    newsTitleUk: 'Заголовок секції новин (Українська)',
    newsTitleEn: 'Заголовок секції новин (English)',
    
    orgDescUk: 'Опис організації (Українська)',
    orgDescEn: 'Опис організації (English)',
    leaderNameUk: 'Ім\'я лідера (Українська)',
    leaderNameEn: 'Ім\'я лідера (English)',
    leaderTitleUk: 'Посада лідера (Українська)',
    leaderTitleEn: 'Посада лідера (English)',
    leaderBioUk: 'Біографія лідера (Українська)',
    leaderBioEn: 'Біографія лідера (English)',
    leaderPhoto: 'Фото лідера',
    gallery: 'Галерея зображень',
    addImage: 'Додати зображення',
    uploadImage: 'Завантажити зображення',
    imageCaption: 'Підпис',
    removeImage: 'Видалити',
    
    save: 'Зберегти',
    saving: 'Збереження...',
    loading: 'Завантаження...',
  },
  en: {
    editHome: 'Edit Homepage',
    backToPages: 'Back to Pages',
    newsTitleUk: 'News Section Title (Ukrainian)',
    newsTitleEn: 'News Section Title (English)',
    
    orgDescUk: 'Organization Description (Ukrainian)',
    orgDescEn: 'Organization Description (English)',
    leaderNameUk: 'Leader Name (Ukrainian)',
    leaderNameEn: 'Leader Name (English)',
    leaderTitleUk: 'Leader Position (Ukrainian)',
    leaderTitleEn: 'Leader Position (English)',
    leaderBioUk: 'Leader Biography (Ukrainian)',
    leaderBioEn: 'Leader Biography (English)',
    leaderPhoto: 'Leader Photo',
    gallery: 'Image Gallery',
    addImage: 'Add Image',
    uploadImage: 'Upload Image',
    imageCaption: 'Caption',
    removeImage: 'Remove',
    
    save: 'Save Changes',
    saving: 'Saving...',
    loading: 'Loading...',
  }
};

type GalleryImage = {
  url: string;
  caption: string;
  order: number;
};

export default function EditHomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newsTitle_uk: '',
    newsTitle_en: '',
    orgDescription_uk: '',
    orgDescription_en: '',
    leaderName_uk: '',
    leaderName_en: '',
    leaderTitle_uk: '',
    leaderTitle_en: '',
    leaderBio_uk: '',
    leaderBio_en: '',
    leaderImageUrl: '',
    galleryImages: [] as GalleryImage[]
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'home')
      .single();

    if (data) {
      setFormData({
        newsTitle_uk: data.content_uk.newsTitle || '',
        newsTitle_en: data.content_en.newsTitle || '',
        orgDescription_uk: data.content_uk.orgDescription || '',
        orgDescription_en: data.content_en.orgDescription || '',
        leaderName_uk: data.content_uk.leaderName || '',
        leaderName_en: data.content_en.leaderName || '',
        leaderTitle_uk: data.content_uk.leaderTitle || '',
        leaderTitle_en: data.content_en.leaderTitle || '',
        leaderBio_uk: data.content_uk.leaderBio || '',
        leaderBio_en: data.content_en.leaderBio || '',
        leaderImageUrl: data.content_uk.leaderImageUrl || '',
        galleryImages: data.content_uk.galleryImages || []
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLeaderPhotoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, leaderImageUrl: url }));
  };

  const addGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      galleryImages: [
        ...prev.galleryImages,
        { url: '', caption: '', order: prev.galleryImages.length }
      ]
    }));
  };

  const handleGalleryImageUpload = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img, i) => 
        i === index ? { ...img, url } : img
      )
    }));
  };

  const updateGalleryCaption = (index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img, i) => 
        i === index ? { ...img, caption } : img
      )
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, order: i }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('pages')
      .update({
        content_uk: {
          newsTitle: formData.newsTitle_uk,
          orgDescription: formData.orgDescription_uk,
          leaderName: formData.leaderName_uk,
          leaderTitle: formData.leaderTitle_uk,
          leaderBio: formData.leaderBio_uk,
          leaderImageUrl: formData.leaderImageUrl,
          galleryImages: formData.galleryImages
        },
        content_en: {
          newsTitle: formData.newsTitle_en,
          orgDescription: formData.orgDescription_en,
          leaderName: formData.leaderName_en,
          leaderTitle: formData.leaderTitle_en,
          leaderBio: formData.leaderBio_en,
          leaderImageUrl: formData.leaderImageUrl,
          galleryImages: formData.galleryImages
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', 'home');

    if (!error) {
      alert('Changes saved successfully!');
      router.push('/admin/pages');
    } else {
      alert('Error saving: ' + error.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <LogoTiles />
            </div>
            <span className="text-gray-400">{t.editHome}</span>
          </div>
          
          <a href="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToPages}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editHome}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ORGANIZATION DESCRIPTION */}
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">📝 Organization Description</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{t.orgDescUk}</label>
                <textarea
                  name="orgDescription_uk"
                  value={formData.orgDescription_uk}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  placeholder="Опис організації..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.orgDescEn}</label>
                <textarea
                  name="orgDescription_en"
                  value={formData.orgDescription_en}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  placeholder="Organization description..."
                />
              </div>
            </div>
          </div>

          {/* LEADER SECTION */}
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">👤 Leader Information</h2>
            
            <div className="space-y-6">
              {/* Leader Photo Upload */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">{t.leaderPhoto}</h3>
                <ImageUpload
                  bucket="leader-photos"
                  onUploadComplete={handleLeaderPhotoUpload}
                  currentImage={formData.leaderImageUrl}
                  label={t.uploadImage}
                />
              </div>

              {/* Leader Name */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderNameUk}</label>
                <input
                  type="text"
                  name="leaderName_uk"
                  value={formData.leaderName_uk}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderNameEn}</label>
                <input
                  type="text"
                  name="leaderName_en"
                  value={formData.leaderName_en}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* Leader Title/Position */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderTitleUk}</label>
                <input
                  type="text"
                  name="leaderTitle_uk"
                  value={formData.leaderTitle_uk}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderTitleEn}</label>
                <input
                  type="text"
                  name="leaderTitle_en"
                  value={formData.leaderTitle_en}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* Leader Biography */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderBioUk}</label>
                <textarea
                  name="leaderBio_uk"
                  value={formData.leaderBio_uk}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.leaderBioEn}</label>
                <textarea
                  name="leaderBio_en"
                  value={formData.leaderBio_en}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* GALLERY */}
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">🖼️ {t.gallery}</h2>
            
            <div className="space-y-4">
              {formData.galleryImages.map((image, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-gray-400">Image {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="text-red-500 hover:text-red-400 text-sm font-bold"
                    >
                      {t.removeImage}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <ImageUpload
                      bucket="gallery-images"
                      onUploadComplete={(url) => handleGalleryImageUpload(index, url)}
                      currentImage={image.url}
                      label={t.uploadImage}
                    />
                    
                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-bold mb-2">{t.imageCaption}</label>
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => updateGalleryCaption(index, e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                        placeholder="Image caption..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addGalleryImage}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                + {t.addImage}
              </button>
            </div>
          </div>

          {/* NEWS TITLE */}
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">📰 News Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{t.newsTitleUk}</label>
                <input
                  type="text"
                  name="newsTitle_uk"
                  value={formData.newsTitle_uk}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.newsTitleEn}</label>
                <input
                  type="text"
                  name="newsTitle_en"
                  value={formData.newsTitle_en}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 text-black px-6 py-4 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
          >
            {submitting ? t.saving : t.save}
          </button>
        </form>
      </main>
    </div>
  );
}