'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import type { Talent } from '@/app/types/talents';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    back: '← Повернутися до талантів',
    biography: 'Біографія',
    achievements: 'Досягнення',
    personalInfo: 'Персональна інформація',
    birthYear: 'Рік народження',
    nationality: 'Національність',
    location: 'Місцезнаходження',
    website: 'Веб-сайт',
    video: 'Відео',
    relatedTalents: 'Схожі таланти',
    visitWebsite: 'Відвідати сайт',
    watchVideo: 'Дивитися відео',
    loading: 'Завантаження...',
    notFound: 'Талант не знайдено',
    views: 'переглядів'
  },
  en: {
    back: '← Back to Talents',
    biography: 'Biography',
    achievements: 'Achievements',
    personalInfo: 'Personal Information',
    birthYear: 'Birth Year',
    nationality: 'Nationality',
    location: 'Location',
    website: 'Website',
    video: 'Video',
    relatedTalents: 'Related Talents',
    visitWebsite: 'Visit Website',
    watchVideo: 'Watch Video',
    loading: 'Loading...',
    notFound: 'Talent not found',
    views: 'views'
  }
};

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [talent, setTalent] = useState<Talent | null>(null);
  const [relatedTalents, setRelatedTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadTalent(params.id as string);
    }
  }, [params.id]);

  async function loadTalent(id: string) {
    setLoading(true);

    // Load talent
    const { data: talentData } = await supabase
      .from('talents')
      .select(`
        *,
        category:talents_categories(*)
      `)
      .eq('id', id)
      .single();

    if (talentData) {
      setTalent(talentData);

      // Increment view count
      await supabase.rpc('increment_talent_views', { talent_id: parseInt(id) });

      // Load related talents (same category)
      if (talentData.category_id) {
        const { data: relatedData } = await supabase
          .from('talents')
          .select(`
            *,
            category:talents_categories(*)
          `)
          .eq('category_id', talentData.category_id)
          .neq('id', id)
          .limit(3);

        if (relatedData) setRelatedTalents(relatedData);
      }
    }

    setLoading(false);
  }

  // Extract YouTube video ID
  function getYouTubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-gray-400 text-2xl py-20">
            {t.notFound}
          </div>
          <div className="text-center">
            <Link href="/talents" className="text-green-500 hover:text-green-400 text-lg">
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Link */}
          <Link 
            href="/talents"
            className="inline-block text-green-500 hover:text-green-400 mb-8 text-lg transition-colors"
          >
            {t.back}
          </Link>

          {/* Hero Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
              {/* Photo */}
              {talent.photo_url && (
                <div className="lg:col-span-1">
                  <img
                    src={talent.photo_url}
                    alt={lang === 'uk' ? talent.name_uk : talent.name_en}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className={talent.photo_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {/* Name */}
                <h1 className="text-5xl font-bold mb-4">
                  {lang === 'uk' ? talent.name_uk : talent.name_en}
                </h1>

                {/* Title */}
                {talent.title_uk && (
                  <p className="text-2xl text-green-500 font-semibold mb-6">
                    {lang === 'uk' ? talent.title_uk : talent.title_en}
                  </p>
                )}

                {/* Category Badge */}
                {talent.category && (
                  <div className="mb-6">
                    <span className="inline-block bg-gray-800 text-green-500 font-bold px-4 py-2 rounded-full">
                      {lang === 'uk' ? talent.category.name_uk : talent.category.name_en}
                    </span>
                  </div>
                )}

                {/* Social Links */}
                {talent.social_links && Object.keys(talent.social_links).length > 0 && (
                  <div className="flex gap-4 mb-6">
                    {talent.social_links.facebook && (
                      <a
                        href={talent.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {talent.social_links.instagram && (
                      <a
                        href={talent.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {talent.social_links.twitter && (
                      <a
                        href={talent.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {talent.social_links.linkedin && (
                      <a
                        href={talent.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {talent.social_links.youtube && (
                      <a
                        href={talent.social_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Website Link */}
                {talent.website_url && (
                  <a
                    href={talent.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors mb-4"
                  >
                    {t.visitWebsite} →
                  </a>
                )}

                {/* View Count */}
                <p className="text-gray-500 text-sm mt-4">
                  {talent.view_count} {t.views}
                </p>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">{t.biography}</h2>
            <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {lang === 'uk' ? talent.bio_uk : talent.bio_en}
            </div>
          </div>

          {/* Achievements */}
          {(talent.achievements_uk || talent.achievements_en) && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6">{t.achievements}</h2>
              <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {lang === 'uk' ? talent.achievements_uk : talent.achievements_en}
              </div>
            </div>
          )}

          {/* Personal Info */}
          {(talent.birth_year || talent.nationality || talent.location) && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6">{t.personalInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {talent.birth_year && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t.birthYear}</p>
                    <p className="text-white text-xl font-semibold">{talent.birth_year}</p>
                  </div>
                )}
                {talent.nationality && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t.nationality}</p>
                    <p className="text-white text-xl font-semibold">{talent.nationality}</p>
                  </div>
                )}
                {talent.location && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t.location}</p>
                    <p className="text-white text-xl font-semibold">{talent.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video */}
          {talent.video_url && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6">{t.video}</h2>
              {getYouTubeId(talent.video_url) ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(talent.video_url)}`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <a
                  href={talent.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  {t.watchVideo} →
                </a>
              )}
            </div>
          )}

          {/* Related Talents */}
          {relatedTalents.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">{t.relatedTalents}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTalents.map((relatedTalent) => (
                  <Link key={relatedTalent.id} href={`/talents/${relatedTalent.id}`}>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors group cursor-pointer">
                      {relatedTalent.photo_url && (
                        <div className="h-64 bg-gray-800 overflow-hidden">
                          <img
                            src={relatedTalent.photo_url}
                            alt={lang === 'uk' ? relatedTalent.name_uk : relatedTalent.name_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                          {lang === 'uk' ? relatedTalent.name_uk : relatedTalent.name_en}
                        </h3>
                        {relatedTalent.title_uk && (
                          <p className="text-green-500 font-semibold text-sm">
                            {lang === 'uk' ? relatedTalent.title_uk : relatedTalent.title_en}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}