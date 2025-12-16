import { supabase } from '@/app/lib/supabase';

const ADMIN_EMAIL = 'romanewsukraine@gmail.com';

export function checkAdmin(): boolean {
  // This is a client-side check that should be used with auth state
  // For now, we'll return false as a placeholder
  // The actual check should be done with the useAdminAuth hook or via server-side
  return false;
}

export async function checkAdminAsync(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  return user.email === ADMIN_EMAIL;
}
