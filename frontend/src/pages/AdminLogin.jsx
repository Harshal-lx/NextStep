import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User as UserIcon, Loader2, ArrowLeft } from "lucide-react";
import FloatingBg from "@/components/FloatingBg";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post("/admin/auth/login", { username, password });
      setUser(r.data.user);
      toast.success("Welcome, admin");
      navigate("/admin", { replace: true, state: { user: r.data.user } });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Invalid credentials");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <FloatingBg />
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6">
          <ArrowLeft className="w-3 h-3"/> Back to NextStep
        </Link>
        <div className="glass-strong rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(139,92,246,0.25)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Shield className="w-5 h-5"/>
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Admin Console</h1>
              <p className="text-xs text-gray-400">Restricted — authorized personnel only</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input
                  data-testid="admin-username"
                  required
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition"
                  placeholder="BLUELOCKZ"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input
                  data-testid="admin-password"
                  required
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              data-testid="admin-login-submit"
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4"/>}
              {submitting ? "Verifying…" : "Sign in to Admin"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-xs text-gray-500 text-center">
            Not an admin? <Link to="/auth" className="text-purple-300 hover:text-purple-200">Student login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
