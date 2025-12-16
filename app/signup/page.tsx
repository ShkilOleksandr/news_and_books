'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';
import LogoTiles from '@/app/components/LogoTiles';

const translations = {
  uk: {
    signUp: 'Реєстрація',
    signUpMessage: 'Створіть обліковий запис для участі у форумі',
    username: "Ім'я користувача",
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Підтвердіть пароль',
    createAccount: 'Створити обліковий запис',
    creating: 'Створення...',
    alreadyHaveAccount: 'Вже є обліковий запис?',
    signIn: 'Увійти',
    errorUsername: "Будь ласка, введіть ім'я користувача",
    errorEmail: 'Будь ласка, введіть email',
    errorPassword: 'Пароль повинен бути мінімум 6 символів',
    errorPasswordMatch: 'Паролі не співпадають',
    successMessage: 'Обліковий запис створено! Перенаправлення...'
  },
  en: {
    signUp: 'Sign Up',
    signUpMessage: 'Create an account to participate in the forum',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creating: 'Creating...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    errorUsername: 'Please enter a username',
    errorEmail: 'Please enter an email',
    errorPassword: 'Password must be at least 6 characters',
    errorPasswordMatch: 'Passwords do not match',
    successMessage: 'Account created! Redirecting...'
  }
};

export default function SignUpPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!username.trim()) {
      setError(t.errorUsername);
      return;
    }

    if (!email.trim()) {
      setError(t.errorEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.errorPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMatch);
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Show success and redirect
      setSuccess(t.successMessage);
      
      setTimeout(() => {
        router.push('/forum');
      }, 2000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-6 pt-24 pb-20">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <LogoTiles size="w-12 h-12" textSize="text-2xl" />
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-2">{t.signUp}</h1>
          <p className="text-gray-400 mb-8">{t.signUpMessage}</p>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-bold mb-2">{t.username}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold mb-2">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                disabled={loading}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? t.creating : t.createAccount}
            </button>

            {/* Link to Login */}
            <div className="text-center text-gray-400 text-sm">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-green-500 hover:text-green-400 transition-colors">
                {t.signIn}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}