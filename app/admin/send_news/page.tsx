'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const translations = {
  uk: {
    title: 'Відправити розсилку',
    subject: 'Тема листа',
    subjectPlaceholder: 'Введіть тему листа...',
    content: 'Зміст листа',
    contentPlaceholder: 'Напишіть ваше повідомлення...',
    preview: 'Попередній перегляд',
    send: 'Відправити розсилку',
    sending: 'Відправка...',
    cancel: 'Скасувати',
    errorSubject: 'Будь ласка, введіть тему',
    errorContent: 'Будь ласка, введіть зміст',
    confirmSend: 'Ви впевнені, що хочете відправити розсилку всім підписникам?',
    successTitle: 'Розсилку відправлено!',
    successMessage: 'Відправлено: {sent} з {total}',
    errorTitle: 'Помилка відправки',
    backToSubscribers: 'Назад до підписників',
    plainText: 'Простий текст',
    testAPI: 'Тест API',
    apiWorking: 'API працює!',
    apiError: 'Помилка API'
  },
  en: {
    title: 'Send Newsletter',
    subject: 'Email Subject',
    subjectPlaceholder: 'Enter email subject...',
    content: 'Email Content',
    contentPlaceholder: 'Write your message...',
    preview: 'Preview',
    send: 'Send Newsletter',
    sending: 'Sending...',
    cancel: 'Cancel',
    errorSubject: 'Please enter a subject',
    errorContent: 'Please enter content',
    confirmSend: 'Are you sure you want to send this newsletter to all subscribers?',
    successTitle: 'Newsletter Sent!',
    successMessage: 'Sent: {sent} out of {total}',
    errorTitle: 'Send Error',
    backToSubscribers: 'Back to Subscribers',
    plainText: 'Plain Text',
    testAPI: 'Test API',
    apiWorking: 'API is working!',
    apiError: 'API Error'
  }
};

export default function SendNewsletterPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState('');

  async function testAPI() {
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: 'Test',
          content: 'Test content'
        })
      });

      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Content-Type:', contentType);
      console.log('Response:', responseText);

      setDebugInfo(`
Status: ${response.status}
Content-Type: ${contentType}
Response: ${responseText.substring(0, 500)}
      `);

      if (contentType?.includes('application/json')) {
        const data = JSON.parse(responseText);
        alert(t.apiWorking + '\n\n' + JSON.stringify(data, null, 2));
      } else {
        alert(t.apiError + '\n\nGot HTML instead of JSON. Check console for details.');
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setDebugInfo('Error: ' + error.message);
      alert(t.apiError + ': ' + error.message);
    }
  }

  async function handleSend() {
    // Validate
    if (!subject.trim()) {
      alert(t.errorSubject);
      return;
    }

    if (!content.trim()) {
      alert(t.errorContent);
      return;
    }

    // Confirm
    if (!confirm(t.confirmSend)) {
      return;
    }

    setSending(true);
    setDebugInfo('');

    try {
      console.log('Sending newsletter...');
      console.log('Subject:', subject);
      console.log('Content:', content.substring(0, 100));

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject.trim(),
          content: content.trim(),
          htmlContent: null // Always use plain text for now
        })
      });

      console.log('Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      // Get response as text first
      const responseText = await response.text();
      console.log('Response text:', responseText);

      setDebugInfo(`Status: ${response.status}\nContent-Type: ${contentType}`);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Not JSON - probably HTML error page
        console.error('Failed to parse JSON:', responseText.substring(0, 500));
        setResult({
          success: false,
          error: 'API повернув HTML замість JSON. Перевірте, чи існує файл app/api/newsletter/send/route.ts'
        });
        setSending(false);
        return;
      }

      console.log('Parsed data:', data);

      if (response.ok && data.success) {
        setResult({
          success: true,
          sent: data.sent,
          total: data.total,
          failed: data.failed
        });
        // Clear form
        setSubject('');
        setContent('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Невідома помилка'
        });
      }
    } catch (error: any) {
      console.error('Send error:', error);
      setResult({
        success: false,
        error: error.message
      });
      setDebugInfo('Exception: ' + error.message);
    } finally {
      setSending(false);
    }
  }

  if (sending) {
    return <LoadingSpinner message={t.sending} />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <div className="flex gap-3">
            <button
              onClick={testAPI}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              {t.testAPI}
            </button>
            <a
              href="/admin/newsletter"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              {t.backToSubscribers}
            </a>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-400 overflow-x-auto">{debugInfo}</pre>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className={`mb-8 p-6 rounded-xl border ${
            result.success 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <h2 className={`text-2xl font-bold mb-2 ${
              result.success ? 'text-green-500' : 'text-red-500'
            }`}>
              {result.success ? t.successTitle : t.errorTitle}
            </h2>
            {result.success ? (
              <div className="text-white">
                <p className="mb-2">
                  {t.successMessage
                    .replace('{sent}', result.sent)
                    .replace('{total}', result.total)}
                </p>
                {result.failed > 0 && (
                  <p className="text-yellow-400">
                    Помилок: {result.failed}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-white">
                <p className="mb-2">{result.error}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-400">Технічні деталі</summary>
                  <pre className="mt-2 text-xs bg-black/50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              {lang === 'uk' ? 'Закрити' : 'Close'}
            </button>
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.subject}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.subjectPlaceholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.content}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.contentPlaceholder}
              rows={15}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          {/* Preview */}
          {content && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t.preview}
              </label>
              <div className="bg-white text-black p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">{subject || '(No subject)'}</h3>
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                setSubject('');
                setContent('');
              }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSend}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-lg font-bold transition-colors"
            >
              {t.send}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
          <h3 className="font-bold text-blue-400 mb-2">
            💡 {lang === 'uk' ? 'Порада' : 'Tip'}
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {lang === 'uk' 
              ? 'Спочатку натисніть "Тест API" щоб перевірити, чи працює API. Якщо тест пройшов успішно, можете відправляти розсилку.'
              : 'First click "Test API" to verify the API is working. If the test passes, you can send the newsletter.'}
          </p>
          <p className="text-xs text-gray-400">
            {lang === 'uk'
              ? 'Файл API має бути тут: app/api/newsletter/send/route.ts'
              : 'API file should be at: app/api/newsletter/send/route.ts'}
          </p>
        </div>
      </div>
    </div>
  );
}