import { Search, Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function TopNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 px-6 py-4 border-b border-white/5 bg-[#0B1020]/70 backdrop-blur-xl flex items-center gap-4">
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          data-testid="topnav-search"
          placeholder="Search opportunities, skills, organizers..."
          className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/40 focus:bg-white/8 transition"
        />
      </div>
      <Link to="/ai-mentor" data-testid="topnav-ai-btn" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white hover:scale-105 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        <Sparkles className="w-4 h-4" /> AI Mentor
      </Link>
      <Link to="/notifications" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition relative" data-testid="topnav-notifications">
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 pulse-ring" />
      </Link>
      {user?.picture ? (
        <img src={user.picture} alt="" className="w-10 h-10 rounded-full border border-white/10" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold">
          {(user?.name || "U")[0]}
        </div>
      )}
    </header>
  );
}
