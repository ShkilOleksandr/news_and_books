'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import LogoTiles from '@/app/components/LogoTiles';
import imageCompression from 'browser-image-compression';

const ADMIN_EMAIL = 'romanewsukraine@gmail.com';

const translations = {
  uk: {
    title: 'Управління командою',
    addMember: 'Додати члена команди',
    nameUk: 'Ім\'я (Українська)',
    nameEn: 'Ім\'я (English)',
    positionUk: 'Посада (Українська)',
    positionEn: 'Посада (English)',
    bioUk: 'Біографія (Українська)',
    bioEn: 'Біографія (English)',
    photo: 'Фото',
    uploadPhoto: 'Завантажити фото',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Редагувати',
    confirmDelete: 'Видалити цього члена команди?',
    uploading: 'Завантаження...',
    compressing: 'Стиснення...'
  },
  en: {
    title: 'Team Management',
    addMember: 'Add Team Member',
    nameUk: 'Name (Ukrainian)',
    nameEn: 'Name (English)',
    positionUk: 'Position (Ukrainian)',
    positionEn: 'Position (English)',
    bioUk: 'Biography (Ukrainian)',
    bioEn: 'Biography (English)',
    photo: 'Photo',
    uploadPhoto: 'Upload Photo',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirmDelete: 'Delete this team member?',
    uploading: 'Uploading...',
    compressing: 'Compressing...'
  }
};

type TeamMember = {
  id?: number;
  name_uk: string;
  name_en: string;
  position_uk: string;
  position_en: string;
  bio_uk: string;
  bio_en: string;
  image_url: string | null;
  display_order: number;
};

export default function TeamManagementPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAdmin();
    loadTeamMembers();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/');
      return;
    }
  };

  const loadTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) {
      setTeamMembers(data);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('team-photos')
        .upload(fileName, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(fileName);

      // Update editing state with new image URL
      if (editing) {
        setEditing({ ...editing, image_url: publicUrl });
      }

      alert('Photo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      if (editing.id) {
        // Update existing
        const { error } = await supabase
          .from('team_members')
          .update({
            name_uk: editing.name_uk,
            name_en: editing.name_en,
            position_uk: editing.position_uk,
            position_en: editing.position_en,
            bio_uk: editing.bio_uk,
            bio_en: editing.bio_en,
            image_url: editing.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('team_members')
          .insert([{
            ...editing,
            display_order: teamMembers.length
          }]);

        if (error) throw error;
      }

      setEditing(null);
      loadTeamMembers();
      alert('Saved successfully!');
    } catch (error: any) {
      console.error('Error saving:', error);
      alert('Error saving: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadTeamMembers();
      alert('Deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error deleting: ' + error.message);
    }
  };

  const startEdit = (member: TeamMember | null) => {
    if (member) {
      setEditing({ ...member });
    } else {
      setEditing({
        name_uk: '',
        name_en: '',
        position_uk: '',
        position_en: '',
        bio_uk: '',
        bio_en: '',
        image_url: null,
        display_order: teamMembers.length
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoTiles />
            <span className="text-gray-400">{t.title}</span>
          </div>
          <a href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <button
            onClick={() => startEdit(null)}
            className="bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
          >
            + {t.addMember}
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editing.id ? t.edit : t.addMember}
            </h2>

            <div className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.photo}</label>
                {editing.image_url && (
                  <img
                    src={editing.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-500 file:text-black
                    hover:file:bg-green-400
                    disabled:opacity-50"
                />
                {uploading && <p className="text-sm text-green-500 mt-2">{t.uploading}</p>}
              </div>

              {/* Name UK */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.nameUk}</label>
                <input
                  type="text"
                  value={editing.name_uk}
                  onChange={(e) => setEditing({ ...editing, name_uk: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.nameEn}</label>
                <input
                  type="text"
                  value={editing.name_en}
                  onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Position UK */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.positionUk}</label>
                <input
                  type="text"
                  value={editing.position_uk}
                  onChange={(e) => setEditing({ ...editing, position_uk: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Position EN */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.positionEn}</label>
                <input
                  type="text"
                  value={editing.position_en}
                  onChange={(e) => setEditing({ ...editing, position_en: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Bio UK */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.bioUk}</label>
                <textarea
                  value={editing.bio_uk}
                  onChange={(e) => setEditing({ ...editing, bio_uk: e.target.value })}
                  rows={4}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              {/* Bio EN */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.bioEn}</label>
                <textarea
                  value={editing.bio_en}
                  onChange={(e) => setEditing({ ...editing, bio_en: e.target.value })}
                  rows={4}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <div className="aspect-square bg-gray-800">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name_uk}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👤
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name_uk}</h3>
                <p className="text-green-500 font-semibold mb-4">{member.position_uk}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(member)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(member.id!)}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}