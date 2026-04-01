import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseAvailable } from '../services/supabase';

const AuthContext = createContext({});

// ─── MOCK USER (used when Supabase is not configured) ─────────────────────────
const MOCK_USER = {
  id: 'mock-user-001',
  email: 'demo@tripbro.app',
  user_metadata: { full_name: 'Demo Traveler' },
};

const DEMO_MODE_KEY = '@tripbro_demo_mode';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!isSupabaseAvailable()) {
        // Check if user previously "logged in" in demo mode
        const saved = await AsyncStorage.getItem(DEMO_MODE_KEY);
        if (saved === 'true') setUser(MOCK_USER);
        setLoading(false);
        return;
      }
      // Real Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    };
    init();
  }, []);

  // ── SIGN UP ──────────────────────────────────────────────────────────────
  const signUp = async (email, password, fullName) => {
    if (!isSupabaseAvailable()) {
      const mockUser = { ...MOCK_USER, email, user_metadata: { full_name: fullName } };
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
  };

  // ── SIGN IN ──────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    if (!isSupabaseAvailable()) {
      // Accept any credentials in demo mode
      const mockUser = { ...MOCK_USER, email };
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  // ── SIGN OUT ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (!isSupabaseAvailable()) {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setUser(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // ── RESET PASSWORD ───────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    if (!isSupabaseAvailable()) {
      return { data: {}, error: null }; // Pretend it worked
    }
    return supabase.auth.resetPasswordForEmail(email);
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signUp, signIn, signOut, resetPassword,
      isDemoMode: !isSupabaseAvailable(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};