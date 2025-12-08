'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import { useUserBanStatus } from '@/app/lib/useuserbanstatus';
import BannedMessage from '@/app/components/Bannedmessage';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Чат',
    typeMessage: 'Напишіть повідомлення...',
    send: 'Відправити',
    loading: 'Завантаження...',
    loginRequired: 'Увійдіть, щоб користуватися чатом',
    login: 'Увійти',
    noMessages: 'Немає повідомлень. Будьте першим!',
    justNow: 'щойно',
    minuteAgo: 'хв тому',
    hourAgo: 'год тому',
    yesterday: 'вчора',
    you: 'Ви',
    delete: 'Видалити',
    deleteConfirm: 'Видалити це повідомлення?',
    loadMore: 'Завантажити більше',
    online: 'В мережі',
    users: 'користувачів'
  },
  en: {
    title: 'Chat',
    typeMessage: 'Type a message...',
    send: 'Send',
    loading: 'Loading...',
    loginRequired: 'Please login to use chat',
    login: 'Login',
    noMessages: 'No messages yet. Be the first!',
    justNow: 'just now',
    minuteAgo: 'min ago',
    hourAgo: 'hr ago',
    yesterday: 'yesterday',
    you: 'You',
    delete: 'Delete',
    deleteConfirm: 'Delete this message?',
    loadMore: 'Load more',
    online: 'Online',
    users: 'users'
  }
};

type Message = {
  id: number;
  user_id: string;
  user_email: string;
  username: string;
  message: string;
  created_at: string;
  is_deleted?: boolean;
};

export default function ChatPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Check if user is banned
  const { isBanned, reason, bannedAt, loading: banCheckLoading } = useUserBanStatus();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadMessages();
      subscribeToMessages();
      trackOnlineUsers();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Check if user is admin
    if (user && user.email === 'romanewsukraine@gmail.com') {
      setIsAdmin(true);
    }
    
    setLoading(false);
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (!newMsg.is_deleted) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function trackOnlineUsers() {
    // Simple presence tracking
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user?.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        user_email: user.email,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        message: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
      messageInputRef.current?.focus();
    } else {
      alert('Error: ' + error.message);
    }

    setSending(false);
  }

  async function handleDelete(messageId: number) {
    if (!confirm(t.deleteConfirm)) return;

    await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(timestamp: string) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return `${diffMins} ${t.minuteAgo}`;
    if (diffHours < 24) return `${diffHours} ${t.hourAgo}`;
    if (diffDays === 1) return t.yesterday;
    
    return messageTime.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading || banCheckLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12">
            <p className="text-xl text-gray-400 mb-6">{t.loginRequired}</p>
            <a
              href="/login"
              className="inline-block bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-lg font-bold transition-colors"
            >
              {t.login}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
          <BannedMessage reason={reason} bannedAt={bannedAt} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{t.title}</h1>
            {isAdmin && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                ADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{onlineUsers} {t.online}</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                {t.noMessages}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.user_id === user?.id
                        ? 'bg-green-500 text-black'
                        : 'bg-gray-800 text-white'
                    } rounded-2xl px-4 py-3`}
                  >
                    {msg.user_id !== user?.id && (
                      <div className="text-xs font-semibold mb-1 opacity-70">
                        {msg.username}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <div className={`text-xs ${
                        msg.user_id === user?.id ? 'text-black/60' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.created_at)}
                      </div>
                      {/* Show delete button if user owns message OR if admin */}
                      {(msg.user_id === user?.id || isAdmin) && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className={`text-xs opacity-60 hover:opacity-100 transition-opacity ${
                            isAdmin && msg.user_id !== user?.id ? 'text-red-400' : ''
                          }`}
                          title={isAdmin && msg.user_id !== user?.id ? 'Admin: Delete message' : t.delete}
                        >
                          {isAdmin && msg.user_id !== user?.id ? '🗑️ Admin' : t.delete}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="border-t border-gray-800 p-4 flex gap-3"
          >
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={t.typeMessage}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
              rows={1}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.send}
            </button>
          </form>
        </div>

        {/* Tip */}
        <div className="mt-4 text-center text-sm text-gray-500">
          💡 {lang === 'uk' 
            ? 'Натисніть Enter для відправки, Shift+Enter для нового рядка'
            : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </div>
    </div>
  );
}