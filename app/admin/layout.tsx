'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

const ADMIN_EMAIL = 'romanewsukraine@gmail.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Allow login page without authentication
    if (pathname === '/admin/login') {
      // If already logged in as admin, redirect to dashboard
      if (user?.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
      }
      setLoading(false);
      setIsAdmin(true); // Allow rendering login page
      return;
    }

    // For all other admin pages, check authentication
    if (!user) {
      // Not logged in - redirect to login
      router.push('/admin/login');
      setLoading(false);
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      // Logged in but not admin - redirect to home
      router.push('/');
      setLoading(false);
      return;
    }

    // Is admin - allow access
    setIsAdmin(true);
    setLoading(false);
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-xl text-gray-400">Перевірка доступу...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (will be redirected)
  if (!isAdmin) {
    return null;
  }

  // Render children for admin
  return <>{children}</>;
}
