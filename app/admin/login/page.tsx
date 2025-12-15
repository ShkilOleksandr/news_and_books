'use client';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    adminLogin: 'Адмін Панель',
    signInMessage: 'Увійдіть для керування контентом',
    email: 'Email',
    password: 'Пароль',
    signIn: 'Увійти',
    signingIn: 'Вхід...'
  },
  en: {
    adminLogin: 'Admin Login',
    signInMessage: 'Sign in to manage your content',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signingIn: 'Signing in...'
  }
};

export default function AdminLoginPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">r</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">o</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">m</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">a</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">р</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">о</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">м</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl">а</div>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-2">{t.adminLogin}</h1>
          <p className="text-gray-400 mb-8">{t.signInMessage}</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}