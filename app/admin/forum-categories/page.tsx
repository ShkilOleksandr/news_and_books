'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';

type ForumCategory = {
  id: number;
  name_uk: string;
  name_en: string;
  description_uk: string;
  description_en: string;
  slug: string;
  display_order: number;
  created_at: string;
};

const translations = {
  uk: {
    title: 'Категорії форуму',
    addCategory: '+ Додати категорію',
    nameUk: 'Назва (UK)',
    nameEn: 'Назва (EN)',
    descriptionUk: 'Опис (UK)',
    descriptionEn: 'Опис (EN)',
    slug: 'Slug (URL)',
    displayOrder: 'Порядок відображення',
    actions: 'Дії',
    edit: 'Редагувати',
    delete: 'Видалити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    create: 'Створити',
    loading: 'Завантаження...',
    noCategories: 'Категорій ще немає',
    deleteConfirm: 'Ви впевнені, що хочете видалити цю категорію?',
  },
  en: {
    title: 'Forum Categories',
    addCategory: '+ Add Category',
    nameUk: 'Name (UK)',
    nameEn: 'Name (EN)',
    descriptionUk: 'Description (UK)',
    descriptionEn: 'Description (EN)',
    slug: 'Slug (URL)',
    displayOrder: 'Display Order',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    loading: 'Loading...',
    noCategories: 'No categories yet',
    deleteConfirm: 'Are you sure you want to delete this category?',
  },
};

export default function ForumCategoriesAdmin() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name_uk: '',
    name_en: '',
    description_uk: '',
    description_en: '',
    slug: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) || 0 : value,
    }));
  }

  function resetForm() {
    setFormData({
      name_uk: '',
      name_en: '',
      description_uk: '',
      description_en: '',
      slug: '',
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      // Update existing category
      const { error } = await supabase
        .from('forum_categories')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating category:', error);
        alert('Помилка при оновленні категорії');
      } else {
        await fetchCategories();
        resetForm();
      }
    } else {
      // Create new category
      const { error } = await supabase
        .from('forum_categories')
        .insert([formData]);

      if (error) {
        console.error('Error creating category:', error);
        alert('Помилка при створенні категорії');
      } else {
        await fetchCategories();
        resetForm();
      }
    }
  }

  function handleEdit(category: ForumCategory) {
    setFormData({
      name_uk: category.name_uk,
      name_en: category.name_en,
      description_uk: category.description_uk,
      description_en: category.description_en,
      slug: category.slug,
      display_order: category.display_order,
    });
    setEditingId(category.id);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm(t.deleteConfirm)) return;

    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      alert('Помилка при видаленні категорії');
    } else {
      await fetchCategories();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-400 text-2xl text-center">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <main>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-6xl font-bold">{t.title}</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
            >
              {t.addCategory}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Name UK */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.nameUk}
                    </label>
                    <input
                      type="text"
                      name="name_uk"
                      value={formData.name_uk}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Name EN */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.nameEn}
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Description UK */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.descriptionUk}
                    </label>
                    <textarea
                      name="description_uk"
                      value={formData.description_uk}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Description EN */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.descriptionEn}
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.slug}
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="general-discussion"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      URL-friendly name (e.g., "general-discussion")
                    </p>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.displayOrder}
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    {editingId ? t.save : t.create}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg">{t.noCategories}</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">
                          {category.name_uk} / {category.name_en}
                        </h3>
                        <span className="text-sm text-gray-500">
                          (Order: {category.display_order})
                        </span>
                      </div>
                      <p className="text-gray-400 mb-2">
                        {category.description_uk}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Slug: <code className="text-green-500">{category.slug}</code>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(category)}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}   