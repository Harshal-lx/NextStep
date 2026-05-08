import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Bookmark, Clock, Target, ArrowUpRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import OpportunityCard from "@/components/OpportunityCard";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Spark = ({ pts = "5,15 15,9 25,12 35,5 45,8 55,3 65,6 75,2" }) => (
  <svg viewBox="0 0 80 20" className="w-full h-8">
    <polyline fill="none" stroke="url(#gx)" strokeWidth="2" points={pts} />
    <defs>
      <linearGradient id="gx" x1="0" x2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);

function daysLeft(d) {
  return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [opps, setOpps] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([api.get("/opportunities"), api.get("/saved")]);
        setOpps(a.data);
        setSavedIds(new Set(b.data.map((o) => o.id)));
      } finally { setLoading(false); }
    })();
  }, []);

  const toggleSave = async (opp) => {
    const isSaved = savedIds.has(opp.id);
    setSavedIds((s) => {
      const ns = new Set(s);
      isSaved ? ns.delete(opp.id) : ns.add(opp.id);
      return ns;
    });
    try {
      isSaved ? await api.delete(`/saved/${opp.id}`) : await api.post(`/saved/${opp.id}`);
      toast.success(isSaved ? "Removed from saved" : "Saved!");
    } catch { toast.error("Failed"); }
  };

  const stats = [
    { label: "Opportunities Applied", value: 14, growth: "+22%", icon: Target, color: "from-blue-500 to-blue-600" },
    { label: "Saved Opportunities", value: savedIds.size, growth: "+8%", icon: Bookmark, color: "from-purple-500 to-purple-600" },
    { label: "Upcoming Deadlines", value: opps.filter(o => daysLeft(o.deadline) < 14).length, growth: "5 this week", icon: Clock, color: "from-amber-500 to-amber-600" },
    { label: "AI Match Score", value: "87%", growth: "+12%", icon: Sparkles, color: "from-emerald-500 to-emerald-600" },
  ];

  const upcoming = opps.slice().sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-8" data-testid="dashboard-root">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-white/10 bg-gradient-to-br from-blue-600/20 via-[#0B1020] to-purple-600/20">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "Builder"} <span className="inline-block animate-float-slow">👋</span>
            </h1>
            <p className="text-gray-300 mb-6">You have {opps.length} opportunities matching your profile. Let's find your next big break.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/opportunities" data-testid="welcome-explore-btn" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.4)]">Explore</Link>
              <Link to="/ai-mentor" data-testid="welcome-ai-btn" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Ask AI Mentor
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-xs text-emerald-400 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" />{s.growth}</span>
              </div>
              <div className="font-heading text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-xs text-gray-400 mb-3">{s.label}</div>
              <Spark />
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommended */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">Recommended for you</h2>
              <Link to="/opportunities" className="text-xs text-blue-300 inline-flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3"/></Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {loading ? Array.from({length:4}).map((_,i)=>(<div key={i} className="glass rounded-2xl h-72 animate-pulse"/>))
                : opps.slice(0, 4).map((o) => <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={toggleSave} />)}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* AI Panel */}
            <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-500/30 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-semibold">AI Recommendations</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Based on your interests, you're a strong fit for AI hackathons and ML internships this season.
                </p>
                <Link to="/ai-mentor" data-testid="ai-panel-cta" className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 inline-flex items-center gap-1.5 hover:scale-105 transition">
                  Open AI Mentor <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold">Upcoming deadlines</h3>
                <Link to="/calendar" className="text-xs text-blue-300">Calendar</Link>
              </div>
              <div className="space-y-3">
                {upcoming.map((o, i) => {
                  const days = daysLeft(o.deadline);
                  const color = days < 7 ? "bg-rose-400" : days < 14 ? "bg-amber-400" : "bg-emerald-400";
                  return (
                    <Link to={`/opportunities/${o.id}`} key={o.id} className="flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 transition">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${color} pulse-ring`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{o.title}</div>
                        <div className="text-xs text-gray-500">{o.organizer}</div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{days}d</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
