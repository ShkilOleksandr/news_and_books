'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const translations = {
  uk: {
    signIn: 'Увійти',
    signUp: 'Реєстрація',
    logout: 'Вийти'
  },
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    logout: 'Logout'
  }
};

export default function ForumAuthButtons() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return <div className="h-10 w-32 bg-gray-800 animate-pulse rounded-lg"></div>;
  }

  if (user) {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-white font-semibold">{username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
        >
          {t.logout}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
      >
        {t.signIn}
      </Link>
      <Link
        href="/signup"
        className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
      >
        {t.signUp}
      </Link>
    </div>
  );
}