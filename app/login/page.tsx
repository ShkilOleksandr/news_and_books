'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const translations = {
  uk: {
    signIn: 'Вхід',
    signInMessage: 'Увійдіть для участі у форумі',
    email: 'Email',
    password: 'Пароль',
    signInButton: 'Увійти',
    signingIn: 'Вхід...',
    dontHaveAccount: 'Немає облікового запису?',
    signUp: 'Зареєструватися'
  },
  en: {
    signIn: 'Sign In',
    signInMessage: 'Sign in to participate in the forum',
    email: 'Email',
    password: 'Password',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up'
  }
};

export default function LoginPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else if (data.user.email == 'romanewsukraine@gmail.com') {
      router.push('/admin/dashboard');
    }
    else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl text-black">K</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl text-black">Y</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl text-black">R</div>
          <div className="w-12 h-12 bg-green-500 flex items-center justify-center font-bold text-2xl text-black">S</div>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-2">{t.signIn}</h1>
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
                disabled={loading}
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
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? t.signingIn : t.signInButton}
            </button>

            <div className="text-center text-gray-400 text-sm">
              {t.dontHaveAccount}{' '}
              <Link href="/signup" className="text-green-500 hover:text-green-400 transition-colors">
                {t.signUp}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}