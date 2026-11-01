import { createClient } from '@supabase/supabase-js';
import { backendURL, publishableKey } from './backend';

// Same Supabase project and tables as the mobile app, so both show the same data.
export const supabase = createClient(backendURL, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

// Email links open the web /verified page, which works for both app and website users.
export const AUTH_REDIRECT = 'https://web-mwdx.vercel.app/#/verified';
