import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();

  // ❌ No token → back to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ All good → allow route
  return <Outlet />;
}
