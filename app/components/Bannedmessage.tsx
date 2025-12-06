'use client';

import { useLanguage } from '@/app/context/LanguageContext';

const translations = {
  uk: {
    title: 'Ваш обліковий запис заблоковано',
    message: 'Ви не можете створювати нові пости або відповіді.',
    reason: 'Причина',
    bannedAt: 'Дата блокування',
    contact: 'Якщо ви вважаєте, що це помилка, зверніться до адміністратора.',
    contactEmail: 'romanewsukraine@gmail.com'
  },
  en: {
    title: 'Your account has been banned',
    message: 'You cannot create new posts or replies.',
    reason: 'Reason',
    bannedAt: 'Banned at',
    contact: 'If you believe this is a mistake, please contact the administrator.',
    contactEmail: 'romanewsukraine@gmail.com'
  }
};

interface BannedMessageProps {
  reason?: string;
  bannedAt?: string;
}

export default function BannedMessage({ reason, bannedAt }: BannedMessageProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="mt-12 bg-red-500/10 border border-red-500/50 rounded-lg p-6 ">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-500 mb-2">{t.title}</h3>
          <p className="text-gray-300 mb-4">{t.message}</p>
          
          {reason && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-1">{t.reason}:</p>
              <p className="text-white">{reason}</p>
            </div>
          )}
          
          {bannedAt && (
            <p className="text-sm text-gray-400 mb-4">
              {t.bannedAt}: {new Date(bannedAt).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-US')}
            </p>
          )}
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">{t.contact}</p>
            <a 
              href={`mailto:${t.contactEmail}`}
              className="text-green-500 hover:text-green-400 font-semibold"
            >
              {t.contactEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}