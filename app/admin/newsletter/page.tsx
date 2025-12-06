'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Підписники розсилки',
    totalSubscribers: 'Всього підписників',
    activeSubscribers: 'Активні',
    search: 'Пошук за email...',
    email: 'Email',
    subscribedAt: 'Дата підписки',
    status: 'Статус',
    actions: 'Дії',
    active: 'Активний',
    inactive: 'Неактивний',
    deactivate: 'Деактивувати',
    activate: 'Активувати',
    delete: 'Видалити',
    confirmDelete: 'Ви впевнені, що хочете видалити цього підписника?',
    confirmDeactivate: 'Деактивувати підписника?',
    confirmActivate: 'Активувати підписника?',
    exportCSV: 'Експортувати CSV',
    noSubscribers: 'Немає підписників',
    loading: 'Завантаження...'
  },
  en: {
    title: 'Newsletter Subscribers',
    totalSubscribers: 'Total Subscribers',
    activeSubscribers: 'Active',
    search: 'Search by email...',
    email: 'Email',
    subscribedAt: 'Subscribed At',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    deactivate: 'Deactivate',
    activate: 'Activate',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this subscriber?',
    confirmDeactivate: 'Deactivate subscriber?',
    confirmActivate: 'Activate subscriber?',
    exportCSV: 'Export CSV',
    noSubscribers: 'No subscribers',
    loading: 'Loading...'
  }
};

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export default function AdminNewsletterPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSubscribers(
        subscribers.filter(sub => 
          sub.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSubscribers(subscribers);
    }
  }, [searchQuery, subscribers]);

  async function loadSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (data) {
      setSubscribers(data);
      setFilteredSubscribers(data);
    }
    setLoading(false);
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const message = currentStatus ? t.confirmDeactivate : t.confirmActivate;
    if (!confirm(message)) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      loadSubscribers();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t.confirmDelete)) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (!error) {
      loadSubscribers();
    }
  }

  function exportToCSV() {
    const csvContent = [
      ['Email', 'Subscribed At', 'Status'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.is_active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return <LoadingSpinner message={t.loading} />;
  }

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <button
            onClick={exportToCSV}
            className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
          >
            {t.exportCSV}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.totalSubscribers}</div>
            <div className="text-4xl font-bold">{subscribers.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.activeSubscribers}</div>
            <div className="text-4xl font-bold text-green-500">{activeCount}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* Subscribers Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {t.noSubscribers}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-bold">{t.email}</th>
                    <th className="text-left p-4 font-bold">{t.subscribedAt}</th>
                    <th className="text-left p-4 font-bold">{t.status}</th>
                    <th className="text-right p-4 font-bold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-800 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm">{sub.email}</span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(sub.subscribed_at).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          sub.is_active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {sub.is_active ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(sub.id, sub.is_active)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              sub.is_active
                                ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                            }`}
                          >
                            {sub.is_active ? t.deactivate : t.activate}
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}