import './globals.css'
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';

export const metadata: Metadata = {
  title: "Roma News Ukraine",
  description: "Ukrainian News Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      style={{
        background: 'url(/sky2.jpg) center/cover fixed',
        minHeight: '100vh'
      }}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body 
        className="text-white relative"
        suppressHydrationWarning
        style={{
          opacity: 0.7,
          backgroundColor: 'transparent',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.8))'
        }}
      >
        {/* Content */}
        <LanguageProvider>
          <Header />
          <main className="min-h-screen relative">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}