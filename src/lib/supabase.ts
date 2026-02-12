import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

console.log("Supabase Client initializing with URL:", supabaseUrl);
if (!supabaseUrl || supabaseUrl.includes('your-supabase-url')) {
    console.warn("Supabase URL is missing or using placeholder!");
}

export const supabase = createClient(supabaseUrl, supabaseKey)