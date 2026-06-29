import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PageLoader } from "./ui";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Role-gated route: redirect to the correct dashboard if in the wrong mode.
  if (role && user.role !== role) {
    return <Navigate to={user.role === "creator" ? "/" : "/dashboard"} replace />;
  }
  return children;
}
