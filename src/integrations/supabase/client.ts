// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ivkasvmrscfbijqiiaeo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2Fzdm1yc2NmYmlqcWlpYWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MDA4ODMsImV4cCI6MjA1MTE3Njg4M30.ikmvtu6LkKgJy7tSipnsp1jfYtllGA-zSUlmjzNHZWs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);