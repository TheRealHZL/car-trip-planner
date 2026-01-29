import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockProfile } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMockMode = !isSupabaseConfigured();

  useEffect(() => {
    if (isMockMode) {
      // In mock mode, simulate a logged-in user
      setUser({
        id: mockProfile.id,
        email: mockProfile.email,
        app_metadata: {},
        user_metadata: { display_name: mockProfile.displayName },
        aud: 'authenticated',
        created_at: mockProfile.createdAt.toISOString(),
      } as User);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      // Simulate successful login in mock mode
      setUser({
        id: mockProfile.id,
        email: email,
        app_metadata: {},
        user_metadata: { display_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      return { error: null };
    }

    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (isMockMode) {
      // Simulate successful registration in mock mode
      setUser({
        id: 'new-user-' + Date.now(),
        email: email,
        app_metadata: {},
        user_metadata: { display_name: displayName || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      return { error: null };
    }

    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (isMockMode) {
      setUser(null);
      setSession(null);
      return;
    }

    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isMockMode,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
