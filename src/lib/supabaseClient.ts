
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and Anon Key
// You can find these in your Supabase project settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
