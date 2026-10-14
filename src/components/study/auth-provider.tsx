import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useNavigate } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<{ user: User | null; loading: boolean; signOut: () => Promise<void> }>({ user: null, loading: true, signOut: async () => {} });
export const useStudentAuth = () => useContext(AuthContext);
export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await navigate({ to: '/auth', search: { mode: 'login' }, replace: true });
  }
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}