'use client';

import { useLanguage } from '@/app/context/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const translations = {
  uk: {
    loading: 'Завантаження...',
  },
  en: {
    loading: 'Loading...',
  }
};

export default function LoadingSpinner({ 
  message, 
  size = 'md',
  fullScreen = true 
}: LoadingSpinnerProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const content = (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-green-500 mb-4 ${sizeClasses[size]}`}></div>
      <p className={`text-gray-400 ${textSizeClasses[size]}`}>
        {message || t.loading}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}