'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

type TeamMember = {
  id: number;
  name_uk: string;
  name_en: string;
  position_uk: string;
  position_en: string;
  bio_uk: string;
  bio_en: string;
  image_url: string | null;
  display_order: number;
};

type AboutContent = {
  mission: string;
  teamText: string;
  values: Array<{ title: string; text: string }>;
};

function ExpandableBio({ bio }: { bio: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <p
        className={`text-gray-400 leading-relaxed whitespace-pre-line transition-all duration-300 ${
          isExpanded ? '' : 'line-clamp-3'
        }`}
      >
        {bio}
      </p>
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

const translations = {
  uk: {
    title: 'Про нас',
    ourTeam: 'Наша команда',
    ourMission: 'Наша місія',
    ourValues: 'Наші цінності',
    noTeam: 'Інформація про команду скоро з\'явиться'
  },
  en: {
    title: 'About Us',
    ourTeam: 'Our Team',
    ourMission: 'Our Mission',
    ourValues: 'Our Values',
    noTeam: 'Team information coming soon'
  }
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  
  const [loading, setLoading] = useState(true);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchData();
  }, [lang]);

  const fetchData = async () => {
    // Fetch about page content (mission, values, team text)
    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('id', 'about')
      .single();

    if (pageData) {
      setAboutContent(lang === 'uk' ? pageData.content_uk : pageData.content_en);
    }

    // Fetch team members from separate table
    const { data: teamData } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (teamData) {
      setTeamMembers(teamData);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-5xl font-bold mb-12 text-center">{t.title}</h1>

        {/* Mission Section */}
        {aboutContent?.mission && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-green-500 text-center">
              {t.ourMission}
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed text-center whitespace-pre-line">
              {aboutContent.mission}
            </p>
          </div>
        )}

        {/* Values Section */}
        {aboutContent?.values && aboutContent.values.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.ourValues}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {aboutContent.values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all"
                >
                  <h3 className="text-2xl font-bold mb-4 text-green-500">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Text */}
        {aboutContent?.teamText && (
          <div className="mb-12">
            <p className="text-xl text-gray-300 leading-relaxed text-center whitespace-pre-line">
              {aboutContent.teamText}
            </p>
          </div>
        )}

        {/* Team Members Section - From new table */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold mb-12 text-center">{t.ourTeam}</h2>
          
          {teamMembers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              {t.noTeam}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500 transition-all group"
                >
                  {/* Photo */}
                  <div className="aspect-square bg-gray-800 overflow-hidden">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={lang === 'uk' ? member.name_uk : member.name_en}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">
                      {lang === 'uk' ? member.name_uk : member.name_en}
                    </h3>
                    <p className="text-green-500 font-semibold mb-4">
                      {lang === 'uk' ? member.position_uk : member.position_en}
                    </p>
                    {(member.bio_uk || member.bio_en) && (
                      <ExpandableBio bio={lang === 'uk' ? member.bio_uk : member.bio_en} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}