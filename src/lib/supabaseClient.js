import { createClient } from '@supabase/supabase-js';

// Supabase Project ID: oshvcebnnuisjdmtwttd
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oshvcebnnuisjdmtwttd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHZjZWJubnVpc2pkbXR3dHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDI4ODcsImV4cCI6MjA5NDcxODg4N30.hTVrUnyyuj6QjdGoCjAzi8e6rBVEZAQ5RrL4x6DyPc4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
