import './globals.css'
import Header from './components/Header';
import Footer from './components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Common Header - appears on ALL pages */}
        <Header />
        
        {/* Page content renders here */}
        {children}
        
        {/* Common Footer - appears on ALL pages */}
        <Footer />
      </body>
    </html>
  )
}