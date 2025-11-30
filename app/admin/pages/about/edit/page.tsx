'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    editAbout: 'Редагувати сторінку "Про нас"',
    backToPages: 'Назад до сторінок',
    missionUk: 'Місія (Українська)',
    missionEn: 'Місія (English)',
    teamTextUk: 'Текст про команду (Українська)',
    teamTextEn: 'Текст про команду (English)',
    values: 'Цінності',
    value: 'Цінність',
    titleUk: 'Назва (Українська)',
    titleEn: 'Назва (English)',
    textUk: 'Текст (Українська)',
    textEn: 'Текст (English)',
    teamMembers: 'Члени команди',
    teamMember: 'Член команди',
    nameUk: 'Ім\'я (Українська)',
    nameEn: 'Ім\'я (English)',
    roleUk: 'Посада (Українська)',
    roleEn: 'Посада (English)',
    photoUrl: 'URL фото',
    addMember: '+ Додати члена команди',
    removeMember: 'Видалити',
    save: 'Зберегти',
    saving: 'Збереження...',
    loading: 'Завантаження...'
  },
  en: {
    editAbout: 'Edit About Page',
    backToPages: 'Back to Pages',
    missionUk: 'Mission (Ukrainian)',
    missionEn: 'Mission (English)',
    teamTextUk: 'Team Text (Ukrainian)',
    teamTextEn: 'Team Text (English)',
    values: 'Values',
    value: 'Value',
    titleUk: 'Title (Ukrainian)',
    titleEn: 'Title (English)',
    textUk: 'Text (Ukrainian)',
    textEn: 'Text (English)',
    teamMembers: 'Team Members',
    teamMember: 'Team Member',
    nameUk: 'Name (Ukrainian)',
    nameEn: 'Name (English)',
    roleUk: 'Role (Ukrainian)',
    roleEn: 'Role (English)',
    photoUrl: 'Photo URL',
    addMember: '+ Add Team Member',
    removeMember: 'Remove',
    save: 'Save Changes',
    saving: 'Saving...',
    loading: 'Loading...'
  }
};

type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export default function EditAboutPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mission_uk: '',
    mission_en: '',
    teamText_uk: '',
    teamText_en: '',
    values_uk: [
      { title: '', text: '' },
      { title: '', text: '' },
      { title: '', text: '' }
    ],
    values_en: [
      { title: '', text: '' },
      { title: '', text: '' },
      { title: '', text: '' }
    ],
    teamMembers_uk: [] as TeamMember[],
    teamMembers_en: [] as TeamMember[]
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
      .eq('id', 'about')
      .single();

    if (data) {
      setFormData({
        mission_uk: data.content_uk.mission || '',
        mission_en: data.content_en.mission || '',
        teamText_uk: data.content_uk.teamText || '',
        teamText_en: data.content_en.teamText || '',
        values_uk: data.content_uk.values || [],
        values_en: data.content_en.values || [],
        teamMembers_uk: data.content_uk.teamMembers || [],
        teamMembers_en: data.content_en.teamMembers || []
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleValueChange = (langKey: 'values_uk' | 'values_en', index: number, field: 'title' | 'text', value: string) => {
    setFormData(prev => ({
      ...prev,
      [langKey]: prev[langKey].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleTeamMemberChange = (langKey: 'teamMembers_uk' | 'teamMembers_en', index: number, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      [langKey]: prev[langKey].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers_uk: [...prev.teamMembers_uk, { name: '', role: '', image: '' }],
      teamMembers_en: [...prev.teamMembers_en, { name: '', role: '', image: '' }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers_uk: prev.teamMembers_uk.filter((_, i) => i !== index),
      teamMembers_en: prev.teamMembers_en.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('pages')
      .update({
        content_uk: {
          mission: formData.mission_uk,
          values: formData.values_uk,
          teamText: formData.teamText_uk,
          teamMembers: formData.teamMembers_uk
        },
        content_en: {
          mission: formData.mission_en,
          values: formData.values_en,
          teamText: formData.teamText_en,
          teamMembers: formData.teamMembers_en
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', 'about');

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
            <span className="text-gray-400">{t.editAbout}</span>
          </div>
          
          <a href="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
            ← {t.backToPages}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.editAbout}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mission */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.missionUk}</label>
            <textarea
              name="mission_uk"
              value={formData.mission_uk}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.missionEn}</label>
            <textarea
              name="mission_en"
              value={formData.mission_en}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Values Ukrainian */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{t.values} (Українська)</h3>
            {formData.values_uk.map((value, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg mb-4">
                <h4 className="font-bold mb-3">{t.value} {index + 1}</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.titleUk}
                    value={value.title}
                    onChange={(e) => handleValueChange('values_uk', index, 'title', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <textarea
                    placeholder={t.textUk}
                    value={value.text}
                    onChange={(e) => handleValueChange('values_uk', index, 'text', e.target.value)}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Values English */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{t.values} (English)</h3>
            {formData.values_en.map((value, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg mb-4">
                <h4 className="font-bold mb-3">{t.value} {index + 1}</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.titleEn}
                    value={value.title}
                    onChange={(e) => handleValueChange('values_en', index, 'title', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <textarea
                    placeholder={t.textEn}
                    value={value.text}
                    onChange={(e) => handleValueChange('values_en', index, 'text', e.target.value)}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Team Text */}
          <div>
            <label className="block text-sm font-bold mb-2">{t.teamTextUk}</label>
            <textarea
              name="teamText_uk"
              value={formData.teamText_uk}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{t.teamTextEn}</label>
            <textarea
              name="teamText_en"
              value={formData.teamText_en}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Team Members Ukrainian */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{t.teamMembers} (Українська)</h3>
              <button
                type="button"
                onClick={addTeamMember}
                className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors"
              >
                {t.addMember}
              </button>
            </div>
            {formData.teamMembers_uk.map((member, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">{t.teamMember} {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1 rounded transition-colors text-sm"
                  >
                    {t.removeMember}
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.nameUk}
                    value={member.name}
                    onChange={(e) => handleTeamMemberChange('teamMembers_uk', index, 'name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder={t.roleUk}
                    value={member.role}
                    onChange={(e) => handleTeamMemberChange('teamMembers_uk', index, 'role', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="url"
                    placeholder={t.photoUrl}
                    value={member.image}
                    onChange={(e) => handleTeamMemberChange('teamMembers_uk', index, 'image', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  {member.image && (
                    <div className="w-32 h-32 rounded-full overflow-hidden">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Team Members English */}
          <div className="pt-6">
            <h3 className="text-2xl font-bold mb-4">{t.teamMembers} (English)</h3>
            {formData.teamMembers_en.map((member, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg mb-4">
                <h4 className="font-bold mb-3">{t.teamMember} {index + 1}</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.nameEn}
                    value={member.name}
                    onChange={(e) => handleTeamMemberChange('teamMembers_en', index, 'name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder={t.roleEn}
                    value={member.role}
                    onChange={(e) => handleTeamMemberChange('teamMembers_en', index, 'role', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <input
                    type="url"
                    placeholder={t.photoUrl}
                    value={member.image}
                    onChange={(e) => handleTeamMemberChange('teamMembers_en', index, 'image', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  {member.image && (
                    <div className="w-32 h-32 rounded-full overflow-hidden">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
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