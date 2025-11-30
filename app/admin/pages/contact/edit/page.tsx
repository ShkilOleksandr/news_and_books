'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    editContact: 'Редагувати сторінку "Контакти"',
    backToPages: 'Назад до сторінок',
    subtitleUk: 'Підзаголовок (Українська)',
    subtitleEn: 'Підзаголовок (English)',
    contactInfo: 'Контактна інформація',
    addressUk: 'Адреса (Українська)',
    addressEn: 'Адреса (English)',
    phone: 'Телефон',
    email: 'Email',
    officeTextUk: 'Текст про офіс (Українська)',
    officeTextEn: 'Текст про офіс (English)',
    socialMedia: 'Соціальні мережі',
    facebook: 'Facebook URL',
    twitter: 'Twitter URL',
    instagram: 'Instagram URL',
    linkedin: 'LinkedIn URL',
    save: 'Зберегти',
    saving: 'Збереження...',
    loading: 'Завантаження...'
  },
  en: {
    editContact: 'Edit Contact Page',
    backToPages: 'Back to Pages',
    subtitleUk: 'Subtitle (Ukrainian)',
    subtitleEn: 'Subtitle (English)',
    contactInfo: 'Contact Information',
    addressUk: 'Address (Ukrainian)',
    addressEn: 'Address (English)',
    phone: 'Phone',
    email: 'Email',
    officeTextUk: 'Office Text (Ukrainian)',
    officeTextEn: 'Office Text (English)',
    socialMedia: 'Social Media',
    facebook: 'Facebook URL',
    twitter: 'Twitter URL',
    instagram: 'Instagram URL',
    linkedin: 'LinkedIn URL',
    save: 'Save Changes',
    saving: 'Saving...',
    loading: 'Loading...'
  }
};

export default function EditContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subtitle_uk: '',
    subtitle_en: '',
    address_uk: '',
    address_en: '',
    phone: '',
    email: '',
    officeText_uk: '',
    officeText_en: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
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
      .eq('id', 'contact')
      .single();

    if (data) {
      setFormData({
        subtitle_uk: data.content_uk.subtitle || '',
        subtitle_en: data.content_en.subtitle || '',
        address_uk: data.content_uk.address || '',
        address_en: data.content_en.address || '',
        phone: data.content_uk.phone || '',
        email: data.content_uk.email || '',
        officeText_uk: data.content_uk.officeText || '',
        officeText_en: data.content_en.officeText || '',
        facebook: data.content_uk.social?.facebook || '',
        twitter: data.content_uk.social?.twitter || '',
        instagram: data.content_uk.social?.instagram || '',
        linkedin: data.content_uk.social?.linkedin || ''
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('pages')
      .update({
        content_uk: {
          subtitle: formData.subtitle_uk,
          address: formData.address_uk,
          phone: formData.phone,
          email: formData.email,
          officeText: formData.officeText_uk,
          social: {
            facebook: formData.facebook,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin
          }
        },
        content_en: {
          subtitle: formData.subtitle_en,
          address: formData.address_en,
          phone: formData.phone,
          email: formData.email,
          officeText: formData.officeText_en,
          social: {
            facebook: formData.facebook,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', 'contact');

    if (!error) {
      router.push('/admin/pages');
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
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">K</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">Y</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">R</div>
              <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold">S</div>
            </div>
            <span className="text-gray-400">{t.editContact}</span>
          </div>
          
          <a href="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToPages}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editContact}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subtitle */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.subtitleUk}</label>
            <textarea
              name="subtitle_uk"
              value={formData.subtitle_uk}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.subtitleEn}</label>
            <textarea
              name="subtitle_en"
              value={formData.subtitle_en}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Contact Information */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{t.contactInfo}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{t.addressUk}</label>
                <input
                  type="text"
                  name="address_uk"
                  value={formData.address_uk}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.addressEn}</label>
                <input
                  type="text"
                  name="address_en"
                  value={formData.address_en}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.phone}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+380 44 123 4567"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.email}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@kyrs.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Office Text */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{lang === 'uk' ? 'Інформація про офіс' : 'Office Information'}</h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">{t.officeTextUk}</label>
              <textarea
                name="officeText_uk"
                value={formData.officeText_uk}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold mb-2">{t.officeTextEn}</label>
              <textarea
                name="officeText_en"
                value={formData.officeText_en}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{t.socialMedia}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">{t.facebook}</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/kyrs"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.twitter}</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/kyrs"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.instagram}</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/kyrs"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.linkedin}</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/kyrs"
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