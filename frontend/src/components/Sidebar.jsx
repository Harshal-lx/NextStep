import { NavLink } from "react-router-dom";
import { LayoutDashboard, Compass, Sparkles, Bookmark, Calendar as CalIcon, BarChart3, Bell, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const studentItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/opportunities", label: "Opportunities", icon: Compass, testid: "nav-opportunities" },
  { to: "/ai-mentor", label: "AI Mentor", icon: Sparkles, testid: "nav-ai-mentor" },
  { to: "/saved", label: "Saved", icon: Bookmark, testid: "nav-saved" },
  { to: "/calendar", label: "Calendar", icon: CalIcon, testid: "nav-calendar" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, testid: "nav-analytics" },
  { to: "/notifications", label: "Notifications", icon: Bell, testid: "nav-notifications" },
  { to: "/profile", label: "Profile", icon: User, testid: "nav-profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const items = isAdmin
    ? [{ to: "/admin", label: "Admin Console", icon: Shield, testid: "nav-admin" }, ...studentItems]
    : studentItems;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/10 bg-[#0B1020]/80 backdrop-blur-2xl z-30">
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-heading font-bold glow-blue">N</div>
        <span className="font-heading font-bold text-lg tracking-tight">NextStep</span>
        {isAdmin && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-200">ADMIN</span>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testid}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          {user?.picture ? (
            <img src={user.picture} alt="" className="w-9 h-9 rounded-full border border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold">
              {(user?.name || "U")[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user?.name || "Guest"}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          data-testid="sidebar-logout-btn"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </aside>
  );
}
