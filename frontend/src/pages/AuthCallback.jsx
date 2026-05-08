import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/auth", { replace: true });
      return;
    }
    const sessionId = match[1];

    (async () => {
      try {
        const r = await api.post("/auth/google/session", { session_id: sessionId });
        setUser(r.data.user);
        const target = r.data.user?.onboarded ? "/dashboard" : "/onboarding";
        // clean URL
        window.history.replaceState({}, "", "/dashboard");
        navigate(target, { replace: true, state: { user: r.data.user } });
      } catch (e) {
        console.error(e);
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      <p className="text-sm">Establishing your secure session…</p>
    </div>
  );
}
