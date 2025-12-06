import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

interface BanInfo {
  isBanned: boolean;
  reason?: string;
  bannedAt?: string;
}

export function useUserBanStatus() {
  const [banInfo, setBanInfo] = useState<BanInfo>({ isBanned: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBanStatus();
  }, []);

  async function checkBanStatus() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: banData } = await supabase
      .from('user_bans')
      .select('reason, banned_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (banData) {
      setBanInfo({
        isBanned: true,
        reason: banData.reason,
        bannedAt: banData.banned_at
      });
    } else {
      setBanInfo({ isBanned: false });
    }

    setLoading(false);
  }

  return { ...banInfo, loading, refresh: checkBanStatus };
}