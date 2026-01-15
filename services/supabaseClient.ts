import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables from Netlify, fall back to current values for development
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://drkrogixxggzwetokgei.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_v2DSZsMi31InUGz6AfMOsA_OUs9pK5p';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);