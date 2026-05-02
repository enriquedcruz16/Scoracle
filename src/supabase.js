import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://okjftsnszxswgmcztsyj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ramZ0c25zenhzd2dtY3p0c3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjQ2MjYsImV4cCI6MjA5MzMwMDYyNn0.UJiSnQ1T3H28ZKIhZFqIvIPf1cMSWZhXjSaRd1rXo04'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
