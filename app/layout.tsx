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
       <body className="text-white relative" suppressHydrationWarning>
        
        {/* Sky Background - Fixed behind everything */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/sky2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -2
          }}
        />
        
        {/* Dark overlay - Controls darkness */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
            zIndex: -1
          }}
        />

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