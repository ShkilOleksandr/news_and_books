'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Управління користувачами',
    totalUsers: 'Всього користувачів',
    bannedUsers: 'Заблоковано',
    search: 'Пошук за email або іменем...',
    username: 'Імя користувача',
    email: 'Email',
    joinedAt: 'Дата реєстрації',
    status: 'Статус',
    actions: 'Дії',
    active: 'Активний',
    banned: 'Заблокований',
    ban: 'Заблокувати',
    unban: 'Розблокувати',
    viewBans: 'Історія блокувань',
    noUsers: 'Немає користувачів',
    loading: 'Завантаження...',
    banReason: 'Причина блокування',
    banReasonPlaceholder: 'Введіть причину блокування...',
    cancel: 'Скасувати',
    confirmBan: 'Підтвердити блокування',
    confirmUnban: 'Розблокувати користувача?',
    banHistory: 'Історія блокувань',
    close: 'Закрити',
    bannedBy: 'Заблокував',
    bannedAt: 'Дата блокування',
    unbannedAt: 'Дата розблокування',
    reason: 'Причина',
    noBanHistory: 'Немає історії блокувань',
    userIdLabel: 'User ID',
    banByUserId: 'Заблокувати за User ID',
    userIdPlaceholder: 'Вставте User ID користувача...',
    invalidUserId: 'Невірний User ID',
    posts: 'постів'
  },
  en: {
    title: 'User Management',
    totalUsers: 'Total Users',
    bannedUsers: 'Banned',
    search: 'Search by email or username...',
    username: 'Username',
    email: 'Email',
    joinedAt: 'Joined At',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    banned: 'Banned',
    ban: 'Ban',
    unban: 'Unban',
    viewBans: 'Ban History',
    noUsers: 'No users',
    loading: 'Loading...',
    banReason: 'Ban Reason',
    banReasonPlaceholder: 'Enter ban reason...',
    cancel: 'Cancel',
    confirmBan: 'Confirm Ban',
    confirmUnban: 'Unban this user?',
    banHistory: 'Ban History',
    close: 'Close',
    bannedBy: 'Banned By',
    bannedAt: 'Banned At',
    unbannedAt: 'Unbanned At',
    reason: 'Reason',
    noBanHistory: 'No ban history',
    userIdLabel: 'User ID',
    banByUserId: 'Ban by User ID',
    userIdPlaceholder: 'Paste user ID here...',
    invalidUserId: 'Invalid User ID',
    posts: 'posts'
  }
};

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string;
  post_count: number;
}

interface BanHistory {
  id: number;
  reason: string;
  banned_at: string;
  unbanned_at: string | null;
  is_active: boolean;
  banned_by: string;
}

export default function AdminUsersPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [banHistory, setBanHistory] = useState<BanHistory[]>([]);
  const [showUserIdBanModal, setShowUserIdBanModal] = useState(false);
  const [userIdToBan, setUserIdToBan] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(user => 
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  async function loadUsers() {
    setLoading(true);

    // Get users who have posted with their username and email
    const { data: threadUsers } = await supabase
      .from('forum_threads')
      .select('user_id, user_email, username, created_at')
      .order('created_at', { ascending: true });

    if (threadUsers) {
      // Group by user_id and get latest info
      const userMap = new Map();
      
      threadUsers.forEach(thread => {
        if (!userMap.has(thread.user_id)) {
          userMap.set(thread.user_id, {
            id: thread.user_id,
            email: thread.user_email || 'Unknown',
            username: thread.username || 'No username',
            created_at: thread.created_at,
            post_count: 1
          });
        } else {
          const user = userMap.get(thread.user_id);
          user.post_count += 1;
          // Update with latest username/email if available
          if (thread.user_email) user.email = thread.user_email;
          if (thread.username) user.username = thread.username;
        }
      });

      // Convert to array
      const uniqueUsers = Array.from(userMap.values());

      // Get ban status for each user
      const usersWithBanStatus = await Promise.all(
        uniqueUsers.map(async (user) => {
          const { data: banData } = await supabase
            .from('user_bans')
            .select('reason')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          return {
            ...user,
            is_banned: !!banData,
            ban_reason: banData?.reason
          };
        })
      );

      setUsers(usersWithBanStatus);
      setFilteredUsers(usersWithBanStatus);
    }

    setLoading(false);
  }

  async function handleBan() {
    if (!selectedUser || !banReason.trim()) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('user_bans')
      .insert({
        user_id: selectedUser.id,
        banned_by: currentUser?.id,
        reason: banReason.trim(),
        is_active: true
      });

    if (!error) {
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
      loadUsers();
      alert('Користувача заблоковано!');
    } else {
      alert('Помилка: ' + error.message);
    }
  }

  async function handleBanByUserId() {
    if (!userIdToBan.trim() || !banReason.trim()) return;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userIdToBan.trim())) {
      alert(t.invalidUserId);
      return;
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('user_bans')
      .insert({
        user_id: userIdToBan.trim(),
        banned_by: currentUser?.id,
        reason: banReason.trim(),
        is_active: true
      });

    if (!error) {
      setShowUserIdBanModal(false);
      setBanReason('');
      setUserIdToBan('');
      loadUsers();
      alert('Користувача заблоковано!');
    } else {
      alert('Помилка: ' + error.message);
    }
  }

  async function handleUnban(userId: string) {
    if (!confirm(t.confirmUnban)) return;

    const { error } = await supabase
      .from('user_bans')
      .update({ 
        is_active: false,
        unbanned_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!error) {
      loadUsers();
      alert('Користувача розблоковано!');
    }
  }

  async function loadBanHistory(userId: string) {
    const { data } = await supabase
      .from('user_bans')
      .select(`
        id,
        reason,
        banned_at,
        unbanned_at,
        is_active,
        banned_by
      `)
      .eq('user_id', userId)
      .order('banned_at', { ascending: false });

    if (data) {
      setBanHistory(data);
      setShowHistoryModal(true);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t.loading} />;
  }

  const bannedCount = users.filter(u => u.is_banned).length;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <button
            onClick={() => setShowUserIdBanModal(true)}
            className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            {t.banByUserId}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.totalUsers}</div>
            <div className="text-4xl font-bold">{users.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="text-gray-400 mb-2">{t.bannedUsers}</div>
            <div className="text-4xl font-bold text-red-500">{bannedCount}</div>
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

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {t.noUsers}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-bold">{t.username}</th>
                    <th className="text-left p-4 font-bold">{t.email}</th>
                    <th className="text-left p-4 font-bold">User ID</th>
                    <th className="text-left p-4 font-bold">{t.status}</th>
                    <th className="text-right p-4 font-bold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                      <td className="p-4">
                        <div>
                          <span className="font-semibold">{user.username}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({user.post_count} {t.posts})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-400">{user.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-500">{user.id.substring(0, 8)}...</span>
                      </td>
                      <td className="p-4">
                        {user.is_banned ? (
                          <div>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 mb-1">
                              {t.banned}
                            </span>
                            {user.ban_reason && (
                              <p className="text-xs text-gray-500 mt-1">
                                {user.ban_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">
                            {t.active}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => loadBanHistory(user.id)}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {t.viewBans}
                          </button>
                          {user.is_banned ? (
                            <button
                              onClick={() => handleUnban(user.id)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              {t.unban}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanModal(true);
                              }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              {t.ban}
                            </button>
                          )}
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

      {/* Ban by User ID Modal */}
      {showUserIdBanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{t.banByUserId}</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">User ID</label>
              <input
                type="text"
                value={userIdToBan}
                onChange={(e) => setUserIdToBan(e.target.value)}
                placeholder={t.userIdPlaceholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">{t.banReason}</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t.banReasonPlaceholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUserIdBanModal(false);
                  setBanReason('');
                  setUserIdToBan('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBanByUserId}
                disabled={!banReason.trim() || !userIdToBan.trim()}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.confirmBan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {t.ban} {selectedUser.username}
            </h2>
            <p className="text-gray-400 mb-2">{selectedUser.email}</p>
            <p className="text-xs text-gray-500 font-mono mb-6">{selectedUser.id}</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">{t.banReason}</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t.banReasonPlaceholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.confirmBan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t.banHistory}</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            
            {banHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t.noBanHistory}</p>
            ) : (
              <div className="space-y-4">
                {banHistory.map((ban) => (
                  <div 
                    key={ban.id} 
                    className={`bg-gray-800 border rounded-lg p-4 ${
                      ban.is_active ? 'border-red-500/50' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ban.is_active 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {ban.is_active ? t.active : 'Unbanned'}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(ban.banned_at).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-white mb-2">{ban.reason}</p>
                    {ban.unbanned_at && (
                      <p className="text-sm text-gray-500">
                        {t.unbannedAt}: {new Date(ban.unbanned_at).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-US')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}