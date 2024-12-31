import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivkasvmrscfbijqiiaeo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2Fzdm1yc2NmYmlqcWlpYWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNDQ0NDAsImV4cCI6MjAxOTYyMDQ0MH0.SvD8sXtfV4IATmVoLlE5njQVEXgZHc4ydKKtUCJHrCk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

// Initialize auth state
const initAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    await supabase.auth.signOut()
  }
}

initAuth()