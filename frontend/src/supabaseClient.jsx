// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// REACT_APP_ prefix کے ساتھ variables لینا
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug information
console.log('====================================');
console.log('Supabase Client Initialization');
console.log('====================================');
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Present' : '✗ Missing');
console.log('====================================');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Supabase environment variables are missing!');
  console.error('Please check your .env file contains:');
  console.error('REACT_APP_SUPABASE_URL=https://cerqrsttskwutpnhbcvq.supabase.co');
                                      //https://cerqrsttskwutpnhbcvq.supabase.co
  console.error('REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcnFyc3R0c2t3dXRwbmhiY3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQzMzM4NSwiZXhwIjoyMDgwMDA5Mzg1fQ.C5d2but4lVKLC1cQNXIaxuqB2Z-XQabORPFgpVOqT90');
}                                          //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcnFyc3R0c2t3dXRwbmhiY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzMzODUsImV4cCI6MjA4MDAwOTM4NX0.zorIOTNMTevhmspNTCxaCuA5nCrrUA2hLLoowny3-rQ
                                           //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcnFyc3R0c2t3dXRwbmhiY3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQzMzM4NSwiZXhwIjoyMDgwMDA5Mzg1fQ.C5d2but4lVKLC1cQNXIaxuqB2Z-XQabORPFgpVOqT90
export const supabase = createClient(supabaseUrl, supabaseAnonKey);