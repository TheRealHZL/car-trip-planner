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

// Create a mock user object
const createMockUser = (email: string, displayName?: string): User => ({
  id: mockProfile.id,
  email: email,
  app_metadata: {},
  user_metadata: { display_name: displayName || email.split('@')[0] },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceMockMode, setForceMockMode] = useState(false);

  // Determine if we're in mock mode (no Supabase or forced)
  const isMockMode = !isSupabaseConfigured() || forceMockMode;

  useEffect(() => {
    const initAuth = async () => {
      // If Supabase is not configured at all, use mock mode immediately
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured, using demo mode');
        setUser(createMockUser(mockProfile.email, mockProfile.displayName));
        setIsLoading(false);
        return;
      }

      // Try to get session from Supabase
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Supabase auth error, falling back to demo mode:', error.message);
          setForceMockMode(true);
          setUser(createMockUser(mockProfile.email, mockProfile.displayName));
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        // Network error or Supabase not reachable
        console.warn('Could not connect to Supabase, using demo mode:', err);
        setForceMockMode(true);
        setUser(createMockUser(mockProfile.email, mockProfile.displayName));
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Only set up auth state listener if Supabase is available and we're not in forced mock mode
    if (isSupabaseConfigured() && supabase && !forceMockMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [forceMockMode]);

  const signIn = async (email: string, password: string) => {
    // Use mock mode if Supabase is not available
    if (isMockMode || !supabase) {
      console.log('Demo mode: Simulating login for', email);
      setUser(createMockUser(email));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If it's a network error, fall back to demo mode
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.warn('Network error during sign in, enabling demo mode');
          setForceMockMode(true);
          setUser(createMockUser(email));
          return { error: null };
        }
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      // Network error - fall back to demo mode
      console.warn('Sign in failed, enabling demo mode:', err);
      setForceMockMode(true);
      setUser(createMockUser(email));
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Use mock mode if Supabase is not available
    if (isMockMode || !supabase) {
      console.log('Demo mode: Simulating registration for', email);
      setUser(createMockUser(email, displayName));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) {
        // If it's a network error, fall back to demo mode
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.warn('Network error during sign up, enabling demo mode');
          setForceMockMode(true);
          setUser(createMockUser(email, displayName));
          return { error: null };
        }
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      // Network error - fall back to demo mode
      console.warn('Sign up failed, enabling demo mode:', err);
      setForceMockMode(true);
      setUser(createMockUser(email, displayName));
      return { error: null };
    }
  };

  const signOut = async () => {
    if (isMockMode || !supabase) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setSession(null);
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
