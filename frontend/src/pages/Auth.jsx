import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import FloatingBg from "@/components/FloatingBg";

export default function Auth() {
  const [tab, setTab] = useState("login");

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <FloatingBg />
      <div className="relative max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: illustration */}
        <div className="hidden lg:block">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-heading font-bold glow-blue">N</div>
            <span className="font-heading font-bold text-xl">NextStep</span>
          </Link>
          <h1 className="font-heading text-5xl font-bold tracking-tight leading-tight mb-6">
            Welcome to the future of <span className="gradient-text">student careers</span>.
          </h1>
          <p className="text-gray-400 mb-10 max-w-md leading-relaxed">
            Sign in once to unlock AI mentorship, personalized opportunities, and a dashboard that grows with you.
          </p>
          <div className="glass-strong rounded-2xl p-5 max-w-sm">
            <div className="flex items-center gap-2 text-xs text-blue-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI insight
            </div>
            <p className="text-sm text-gray-300">"You match 87% with the AI Hackathon 2026 — apply by Apr 15 to maximize prize potential."</p>
          </div>
        </div>

        {/* Right: card */}
        <div className="glass-strong rounded-3xl p-8 md:p-10 max-w-md w-full mx-auto shadow-[0_0_60px_rgba(59,130,246,0.2)]">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full mb-8 border border-white/10">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                data-testid={`auth-tab-${t}`}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  tab === t ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>

          <h2 className="font-heading text-2xl font-bold mb-2">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {tab === "login" ? "Continue with Google to access your dashboard." : "One-click signup with your university email."}
          </p>

          <button
            onClick={handleGoogle}
            data-testid="google-auth-btn"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full bg-white text-[#0B1020] font-semibold hover:bg-white/95 transition shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-white/10" />
            <span>secure SSO</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="text-xs text-gray-500 text-center leading-relaxed">
            By continuing you agree to NextStep's <a className="text-blue-400 hover:underline">Terms</a> and <a className="text-blue-400 hover:underline">Privacy Policy</a>.
          </div>

          <Link to="/" className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300">
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
