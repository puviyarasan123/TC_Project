import { createClient } from '@supabase/supabase-js';

// Regular client — used for auth & data by the logged-in user
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!,
  { auth: { storageKey: 'tc-app-anon' } }
);

// Admin client — service role, NO session persistence, used only for admin API calls
export const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      storageKey: 'tc-app-admin',
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
