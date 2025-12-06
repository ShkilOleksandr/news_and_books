import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

const ADMIN_EMAIL = 'romanewsukraine@gmail.com';

export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Not logged in
      router.push('/admin/login');
      setLoading(false);
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      // Logged in but not admin
      router.push('/');
      setLoading(false);
      return;
    }

    // Is admin
    setIsAdmin(true);
    setLoading(false);
  }

  return { loading, isAdmin };
}