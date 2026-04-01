import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

const NO_SUPABASE =
  !CONFIG.SUPABASE_URL ||
  CONFIG.SUPABASE_URL === 'https://xzuiyobhhtaupqhbvozy.supabase.co' ||
  !CONFIG.SUPABASE_ANON_KEY ||
  CONFIG.SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWl5b2JoaHRhdXBxaGJ2b3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODUwNDQsImV4cCI6MjA5MDM2MTA0NH0.quRGM70FVr0HHBzriCzT1KniUQ4xI_mWJxnlx1pve9I';

// Real Supabase client (only created when keys exist)
export const supabase = NO_SUPABASE
  ? null
  : createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

export const isSupabaseAvailable = () => !NO_SUPABASE;