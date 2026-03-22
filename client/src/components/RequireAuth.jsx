import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return null;
  if (!currentUser) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
