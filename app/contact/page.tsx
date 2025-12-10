'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const translations = {
  uk: {
    contact: 'Контакти',
    getInTouch: 'Зв\'яжіться з нами',
    name: 'Ім\'я',
    email: 'Email',
    subject: 'Тема',
    message: 'Повідомлення',
    send: 'Надіслати',
    contactInfo: 'Контактна інформація',
    address: 'Адреса',
    phone: 'Телефон',
    emailLabel: 'Email',
    office: 'Наш офіс',
    namePlaceholder: 'Ваше ім\'я',
    emailPlaceholder: 'your@email.com',
    subjectPlaceholder: 'Чим ми можемо допомогти?',
    messagePlaceholder: 'Розкажіть нам більше...',
    success: 'Повідомлення надіслано!',
    error: 'Сталася помилка. Спробуйте пізніше.',
    loading: 'Надсилання...'
  },
  en: {
    contact: 'Contact',
    getInTouch: 'Get in Touch',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send Message',
    contactInfo: 'Contact Information',
    address: 'Address',
    phone: 'Phone',
    emailLabel: 'Email',
    office: 'Our Office',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'your@email.com',
    subjectPlaceholder: 'How can we help?',
    messagePlaceholder: 'Tell us more...',
    success: 'Message sent!',
    error: 'Something went wrong. Try again later.',
    loading: 'Sending...'
  }
};

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchContactData();
  }, [lang]);

  const fetchContactData = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'contact')
      .single();

    if (data) {
      setContactData(lang === 'uk' ? data.content_uk : data.content_en);
    }
    setLoading(false);
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed');

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (err) {
      console.error(err);
      setStatus('error');
    }

    setTimeout(() => setStatus('idle'), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6">{t.getInTouch}</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {contactData?.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Form */}
          <div className="bg-gray-900 p-8 rounded-2xl">

            {status === 'success' && (
              <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
                {t.success}
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                {t.error}
              </div>
            )}

            <h2 className="text-3xl font-bold mb-6">{t.send}</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">{t.name}</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.email}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.subject}</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t.subjectPlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t.message}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.messagePlaceholder}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full bg-green-500 text-black px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-400 disabled:opacity-50"
              >
                {status === 'loading' ? t.loading : t.send}
              </button>
            </div>
          </div>

          <div className="space-y-8">
  {/* Contact Information */}
  <div className="bg-gray-900 p-8 rounded-2xl">
    <h2 className="text-3xl font-bold mb-6">{t.contactInfo}</h2>

    <div className="space-y-6">

      {/* Address */}
      {contactData?.address && (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{t.address}</h3>
            <p className="text-gray-400">{contactData.address}</p>
          </div>
        </div>
      )}

      {/* Phone */}
      {contactData?.phone && (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{t.phone}</h3>
            <p className="text-gray-400">{contactData.phone}</p>
          </div>
        </div>
      )}

      {/* Email */}
      {contactData?.email && (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{t.emailLabel}</h3>
            <p className="text-gray-400">{contactData.email}</p>
          </div>
        </div>
      )}

    </div>
  </div>

  {/* Office Information */}
  {contactData?.officeText && (
    <div className="bg-gradient-to-br from-green-500/10 to-transparent p-8 rounded-2xl border border-green-500/20">
      <h3 className="text-2xl font-bold mb-4">{t.office}</h3>
      <p className="text-gray-300 mb-6">{contactData.officeText}</p>

      {/* Social Media */}
      {contactData.social && (
        <div className="flex gap-3">

          {/* Facebook */}
          {contactData.social.facebook && (
            <a
              href={contactData.social.facebook}
              target="_blank"
              className="w-12 h-12 bg-gray-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 
5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 
1.792-4.669 4.533-4.669 1.312 0 2.686.235 
2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 
1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 
23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          )}

          {/* Twitter */}
          {contactData.social.twitter && (
            <a
              href={contactData.social.twitter}
              target="_blank"
              className="w-12 h-12 bg-gray-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 
4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 
1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 
1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 
2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 
003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 
004.604 3.417 9.867 9.867 0 01-6.102 
2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 
007.557 2.209c9.053 0 13.998-7.496 
13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 
0024 4.59z"/>
              </svg>
            </a>
          )}

          {/* Instagram */}
          {contactData.social.instagram && (
            <a
              href={contactData.social.instagram}
              target="_blank"
              className="w-12 h-12 bg-gray-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 
7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 
1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 
7.053.012 8.333 0 8.74 0 12s.015 3.667.072 
4.947c.06 1.277.261 2.148.558 2.913.306.788.717 
1.459 1.384 2.126.667.666 1.336 1.079 2.126 
1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 
12 24s3.667-.015 4.947-.072c1.277-.06 
2.148-.262 2.913-.558.788-.306 1.459-.718 
2.126-1.384.666-.667 1.079-1.335 
1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 
1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 
0 12 0zm0 16c-2.21 0-4-1.79-4-4s1.79-4 
4-4 4 1.79 4 4-1.79 4-4 4z"/>
              </svg>
            </a>
          )}

          {/* LinkedIn */}
          {contactData.social.linkedin && (
            <a
              href={contactData.social.linkedin}
              target="_blank"
              className="w-12 h-12 bg-gray-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 
5v14c0 2.761 2.239 5 5 5h14c2.762 
0 5-2.239 
5-5v-14c0-2.761-2.238-5-5-5zm-11 
19h-3v-11h3v11zm-1.5-12.268c-.966 
0-1.75-.79-1.75-1.764s.784-1.764 
1.75-1.764 1.75.79 1.75 1.764-.783 
1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 
0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 
7 2.476v6.759z"/>
              </svg>
            </a>
          )}

        </div>
      )}

    </div>
  )}
</div>
  

        </div>
      </div>
    </div>
  );
}
