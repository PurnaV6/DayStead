import { createClient } from '@supabase/supabase-js';

/**
 * Not wired into any screen yet, the MVP runs entirely on local
 * AsyncStorage (see src/storage/repository.ts). This client is here so that
 * moving to a real backend later is a swap of the repository layer's
 * internals, not a rewrite of the app. Set these two env vars (via
 * app.config.js / EAS secrets) when that migration happens.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
