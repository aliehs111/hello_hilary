import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin() {
  const { currentUser, isLoading, isAdmin } = useAuth();
  if (isLoading) return null;
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/gallery" replace />;
  return <Outlet />;
}
