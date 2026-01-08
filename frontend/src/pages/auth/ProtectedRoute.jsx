import { Navigate, Outlet } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export default function ProtectedRoute() {
  // ✅ 1) Check token (your app logic)
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ❌ No token → back to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 2) Optional: also check Supabase session (extra safety)
  const session = supabase.auth.getSession();

  // If something is wrong with session (rare case)
  if (!session) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // ✅ All good → allow route
  return <Outlet />;
}
