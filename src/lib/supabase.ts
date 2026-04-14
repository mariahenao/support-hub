import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://skajniihdxlhdutilurp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWpuaWloZHhsaGR1dGlsdXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDA5NTYsImV4cCI6MjA5MTc3Njk1Nn0.Ngy3DxNEO600yDUziXUHxleh_utsz3w-aT04hnHaKb4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
