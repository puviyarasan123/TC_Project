import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../api/supabase';
import { getMyProfile } from '../lib/auth';
import { UserProfile } from '../types/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthCtx {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ session: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) getMyProfile().then(setProfile);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) getMyProfile().then(setProfile);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
