'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import type { Talent, TalentsCategory, SocialLinks } from '@/app/types/talents';

const translations = {
  uk: {
    title: 'Управління талантами',
    addTalent: '+ Додати талант',
    nameUk: "Ім'я (Українською)",
    nameEn: "Ім'я (Англійською)",
    titleUk: 'Титул (Українською)',
    titleEn: 'Титул (Англійською)',
    bioUk: 'Біографія (Українською)',
    bioEn: 'Біографія (Англійською)',
    achievementsUk: 'Досягнення (Українською)',
    achievementsEn: 'Досягнення (Англійською)',
    category: 'Категорія',
    selectCategory: 'Оберіть категорію',
    mainPhoto: 'Головне фото',
    uploadPhoto: 'Завантажити фото',
    birthYear: 'Рік народження',
    nationality: 'Національність',
    location: 'Місцезнаходження',
    websiteUrl: 'Веб-сайт',
    videoUrl: 'Відео URL (YouTube/Vimeo)',
    socialLinks: 'Соціальні мережі',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    featured: 'Відзначений',
    save: 'Зберегти',
    cancel: 'Скасувати',
    edit: 'Редагувати',
    delete: 'Видалити',
    views: 'переглядів',
    confirmDelete: 'Ви впевнені, що хочете видалити цей талант?',
    creating: 'Створення...',
    updating: 'Оновлення...',
    uploading: 'Завантаження...',
    errorName: "Будь ласка, введіть ім'я українською",
    errorBio: 'Будь ласка, введіть біографію українською',
    errorUploading: 'Помилка завантаження файлу',
    successCreated: 'Талант успішно створено',
    successUpdated: 'Талант успішно оновлено',
    successDeleted: 'Талант успішно видалено'
  },
  en: {
    title: 'Manage Talents',
    addTalent: '+ Add Talent',
    nameUk: 'Name (Ukrainian)',
    nameEn: 'Name (English)',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    bioUk: 'Biography (Ukrainian)',
    bioEn: 'Biography (English)',
    achievementsUk: 'Achievements (Ukrainian)',
    achievementsEn: 'Achievements (English)',
    category: 'Category',
    selectCategory: 'Select category',
    mainPhoto: 'Main Photo',
    uploadPhoto: 'Upload photo',
    birthYear: 'Birth Year',
    nationality: 'Nationality',
    location: 'Location',
    websiteUrl: 'Website URL',
    videoUrl: 'Video URL (YouTube/Vimeo)',
    socialLinks: 'Social Media',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    featured: 'Featured',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    views: 'views',
    confirmDelete: 'Are you sure you want to delete this talent?',
    creating: 'Creating...',
    updating: 'Updating...',
    uploading: 'Uploading...',
    errorName: 'Please enter a name in Ukrainian',
    errorBio: 'Please enter a biography in Ukrainian',
    errorUploading: 'Error uploading file',
    successCreated: 'Talent created successfully',
    successUpdated: 'Talent updated successfully',
    successDeleted: 'Talent deleted successfully'
  }
};

export default function AdminTalentsPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [talents, setTalents] = useState<Talent[]>([]);
  const [categories, setCategories] = useState<TalentsCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form state
  const [nameUk, setNameUk] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [titleUk, setTitleUk] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bioUk, setBioUk] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [achievementsUk, setAchievementsUk] = useState('');
  const [achievementsEn, setAchievementsEn] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [nationality, setNationality] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Social links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  useEffect(() => {
    loadTalents();
    loadCategories();
  }, []);

  async function loadTalents() {
    const { data } = await supabase
      .from('talents')
      .select(`
        *,
        category:talents_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (data) setTalents(data);
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('talents_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
  }

  async function uploadPhoto(file: File) {
    console.log('Starting photo upload:', file.name);
    setUploadingPhoto(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('talents-photos')
      .upload(filePath, file);

    setUploadingPhoto(false);

    if (error) {
      console.error('Photo upload error:', error);
      alert(`Photo upload failed: ${error.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('talents-photos')
      .getPublicUrl(filePath);

    console.log('Photo uploaded:', publicUrl);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('=== Form Submit Started ===');
    setMessage('');

    if (!nameUk.trim()) {
      setMessage(t.errorName);
      return;
    }

    if (!bioUk.trim()) {
      setMessage(t.errorBio);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('You must be logged in');
        setLoading(false);
        return;
      }

      let finalPhotoUrl = photoUrl;

      // Upload photo if new file selected
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile);
        if (!uploadedUrl) {
          setMessage(t.errorUploading);
          setLoading(false);
          return;
        }
        finalPhotoUrl = uploadedUrl;
      }

      // Build social links object
      const socialLinks: SocialLinks = {};
      if (facebook) socialLinks.facebook = facebook;
      if (instagram) socialLinks.instagram = instagram;
      if (twitter) socialLinks.twitter = twitter;
      if (linkedin) socialLinks.linkedin = linkedin;
      if (youtubeLink) socialLinks.youtube = youtubeLink;

      const talentData = {
        category_id: categoryId,
        name_uk: nameUk.trim(),
        name_en: nameEn.trim() || nameUk.trim(),
        title_uk: titleUk.trim() || null,
        title_en: titleEn.trim() || null,
        bio_uk: bioUk.trim(),
        bio_en: bioEn.trim() || bioUk.trim(),
        achievements_uk: achievementsUk.trim() || null,
        achievements_en: achievementsEn.trim() || null,
        photo_url: finalPhotoUrl || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        nationality: nationality.trim() || null,
        location: location.trim() || null,
        website_url: websiteUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        uploaded_by: user.id,
        is_featured: isFeatured,
      };

      console.log('Saving to database:', talentData);

      if (editingTalent) {
        const { error } = await supabase
          .from('talents')
          .update(talentData)
          .eq('id', editingTalent.id);

        if (error) throw error;
        setMessage(t.successUpdated);
      } else {
        const { error } = await supabase
          .from('talents')
          .insert([talentData]);

        if (error) throw error;
        setMessage(t.successCreated);
      }

      resetForm();
      loadTalents();
      setIsFormOpen(false);
      console.log('=== Form Submit Completed ===');
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setNameUk('');
    setNameEn('');
    setTitleUk('');
    setTitleEn('');
    setBioUk('');
    setBioEn('');
    setAchievementsUk('');
    setAchievementsEn('');
    setCategoryId(null);
    setPhotoFile(null);
    setPhotoUrl('');
    setBirthYear('');
    setNationality('');
    setLocation('');
    setWebsiteUrl('');
    setVideoUrl('');
    setFacebook('');
    setInstagram('');
    setTwitter('');
    setLinkedin('');
    setYoutubeLink('');
    setIsFeatured(false);
    setEditingTalent(null);
  }

  function handleEdit(talent: Talent) {
    setEditingTalent(talent);
    setNameUk(talent.name_uk);
    setNameEn(talent.name_en);
    setTitleUk(talent.title_uk || '');
    setTitleEn(talent.title_en || '');
    setBioUk(talent.bio_uk);
    setBioEn(talent.bio_en);
    setAchievementsUk(talent.achievements_uk || '');
    setAchievementsEn(talent.achievements_en || '');
    setCategoryId(talent.category_id);
    setPhotoUrl(talent.photo_url || '');
    setBirthYear(talent.birth_year?.toString() || '');
    setNationality(talent.nationality || '');
    setLocation(talent.location || '');
    setWebsiteUrl(talent.website_url || '');
    setVideoUrl(talent.video_url || '');
    setFacebook(talent.social_links?.facebook || '');
    setInstagram(talent.social_links?.instagram || '');
    setTwitter(talent.social_links?.twitter || '');
    setLinkedin(talent.social_links?.linkedin || '');
    setYoutubeLink(talent.social_links?.youtube || '');
    setIsFeatured(talent.is_featured);
    setIsFormOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm(t.confirmDelete)) return;

    const { error } = await supabase
      .from('talents')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage(t.successDeleted);
      loadTalents();
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
            {t.addTalent}
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
              {/* Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">{t.nameUk} *</label>
                  <input
                    type="text"
                    value={nameUk}
                    onChange={(e) => setNameUk(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.nameEn}</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">{t.titleUk}</label>
                  <input
                    type="text"
                    value={titleUk}
                    onChange={(e) => setTitleUk(e.target.value)}
                    placeholder="Олімпійський чемпіон"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.titleEn}</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Olympic Champion"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.bioUk} *</label>
                <textarea
                  value={bioUk}
                  onChange={(e) => setBioUk(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.bioEn}</label>
                <textarea
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.achievementsUk}</label>
                <textarea
                  value={achievementsUk}
                  onChange={(e) => setAchievementsUk(e.target.value)}
                  rows={4}
                  placeholder="• Досягнення 1&#10;• Досягнення 2"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.achievementsEn}</label>
                <textarea
                  value={achievementsEn}
                  onChange={(e) => setAchievementsEn(e.target.value)}
                  rows={4}
                  placeholder="• Achievement 1&#10;• Achievement 2"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Category & Photo */}
              <div className="grid grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-bold mb-2">{t.mainPhoto}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                  {uploadingPhoto && <p className="text-green-500 mt-2">{t.uploading}</p>}
                </div>
              </div>

              {/* Photo Preview */}
              {photoUrl && (
                <div>
                  <img src={photoUrl} alt="Preview" className="max-w-xs rounded-lg" />
                </div>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">{t.birthYear}</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1990"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.nationality}</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Ukrainian"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.location}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kyiv, Ukraine"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">{t.websiteUrl}</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.videoUrl}</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-bold mb-4">{t.socialLinks}</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Facebook URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="Twitter URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="url"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="YouTube URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                </div>
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
                  disabled={loading || uploadingPhoto}
                  className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? (editingTalent ? t.updating : t.creating) : t.save}
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

        {/* Talents List */}
        <div className="space-y-4">
          {talents.map((talent) => (
            <div key={talent.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex gap-6">
              {/* Photo */}
              {talent.photo_url && (
                <img
                  src={talent.photo_url}
                  alt={talent.name_uk}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">{lang === 'uk' ? talent.name_uk : talent.name_en}</h3>
                {talent.title_uk && (
                  <p className="text-green-500 font-semibold mb-2">
                    {lang === 'uk' ? talent.title_uk : talent.title_en}
                  </p>
                )}
                <p className="text-gray-400 mb-3 line-clamp-2">
                  {lang === 'uk' ? talent.bio_uk : talent.bio_en}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {talent.category && (
                    <span className="bg-gray-800 text-green-500 px-3 py-1 rounded-full">
                      {lang === 'uk' ? talent.category.name_uk : talent.category.name_en}
                    </span>
                  )}
                  <span>{talent.view_count} {t.views}</span>
                  {talent.is_featured && <span className="text-green-500">⭐ Featured</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(talent)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  {t.edit}
                </button>
                <button
                  onClick={() => handleDelete(talent.id)}
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