import { useEffect, useState } from 'react';
import { supabaseConfig } from '@/src/config/supabase';

// Id do usuário logado ('' enquanto carrega ou se não houver sessão)
export function useCurrentUser() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    supabaseConfig.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || '');
    });
  }, []);

  return userId;
}
