import './globals.css'
import Header from './components/Header';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}