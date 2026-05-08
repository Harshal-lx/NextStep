import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, requireOnboarded = false, requireAdmin = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }
  if (requireAdmin) {
    if (!user) return <Navigate to="/admin-login" replace />;
    if (user.role !== "admin") return <Navigate to="/admin-login" replace />;
    return children;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}
