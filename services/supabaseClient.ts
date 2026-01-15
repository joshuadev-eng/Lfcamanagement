import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION READY SUPABASE CLIENT
 * When deploying to Netlify:
 * 1. Go to Site Settings > Environment Variables
 * 2. Add SUPABASE_URL and SUPABASE_ANON_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://drkrogixxggzwetokgei.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_v2DSZsMi31InUGz6AfMOsA_OUs9pK5p';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Ensure environment variables are set in Netlify.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);