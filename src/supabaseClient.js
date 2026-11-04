import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jslmowsnimcvfqhmmsan.supabase.co'
const supabaseAnonKey = 'sb_publishable_K155hwzabL8SaHdc20oKoQ_VJ4GHdgg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
