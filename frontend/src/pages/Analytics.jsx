import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Sparkles, Target, Bookmark, MessageSquare, TrendingUp, Flame, Award } from "lucide-react";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#EF4444"];

function Donut({ data }) {
  const entries = Object.entries(data || {});
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  let acc = 0;
  const r = 60, c = 70, sw = 18;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
        {entries.map(([k, v], i) => {
          const len = (v / total) * circ;
          const off = circ - acc;
          acc += len;
          return (
            <circle key={k} cx={c} cy={c} r={r} fill="none"
              stroke={COLORS[i % COLORS.length]} strokeWidth={sw}
              strokeDasharray={`${len} ${circ}`} strokeDashoffset={off}
              strokeLinecap="round" />
          );
        })}
        <text x="70" y="68" textAnchor="middle" fill="white" fontSize="22" fontWeight="700"
          transform="rotate(90 70 70)" fontFamily="Outfit">{total}</text>
        <text x="70" y="86" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10"
          transform="rotate(90 70 70)">total</text>
      </svg>
      <div className="space-y-2 text-sm">
        {entries.length === 0 && <div className="text-gray-500 text-xs">No saved opportunities yet</div>}
        {entries.map(([k, v], i) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
            <span className="capitalize text-gray-300">{k}</span>
            <span className="text-gray-500 ml-auto">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RingChart({ value }) {
  const r = 60, c = 70, sw = 14;
  const circ = 2 * Math.PI * r;
  const len = (value / 100) * circ;
  return (
    <div className="relative w-[160px] h-[160px]">
      <svg width="160" height="160" viewBox="0 0 140 140" className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#8B5CF6"/>
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
        <circle cx={c} cy={c} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={sw}
          strokeDasharray={`${len} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold gradient-text">{value}%</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">complete</span>
      </div>
    </div>
  );
}

function Bars({ days = [3, 5, 2, 8, 6, 9, 4] }) {
  const max = Math.max(...days, 1);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex items-end justify-between h-32 gap-2">
      {days.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-purple-500 transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}/>
          <span className="text-[10px] text-gray-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/analytics/me").then(r => setData(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Applications", value: data?.applied_count ?? "–", icon: Target, color: "from-blue-500 to-blue-600", trend: "+22%" },
    { label: "Saved", value: data?.saved_count ?? "–", icon: Bookmark, color: "from-purple-500 to-purple-600", trend: "+8%" },
    { label: "AI conversations", value: data?.chat_count ?? "–", icon: MessageSquare, color: "from-emerald-500 to-cyan-500", trend: "+34%" },
    { label: "Avg. match score", value: `${data?.match_score_avg ?? "–"}%`, icon: Sparkles, color: "from-amber-500 to-orange-500", trend: "+12%" },
  ];

  return (
    <AppShell>
      <div className="space-y-8" data-testid="analytics-root">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2"><Sparkles className="w-3.5 h-3.5"/>Personal Analytics</div>
          <h1 className="font-heading text-3xl font-bold mb-1">Your career, in numbers</h1>
          <p className="text-sm text-gray-400">Track your applications, AI usage, and progress toward your goals.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" strokeWidth={1.8}/>
                </div>
                <span className="text-xs text-emerald-400 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3"/>{s.trend}</span>
              </div>
              <div className="font-heading text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold">Profile completeness</h3>
              <Award className="w-4 h-4 text-amber-400"/>
            </div>
            <div className="flex flex-col items-center">
              <RingChart value={data?.profile_completeness ?? 0}/>
              <p className="text-xs text-gray-400 text-center mt-4 max-w-[220px]">
                Complete onboarding, add skills & a bio to unlock better AI matches.
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-semibold mb-5">Saved by category</h3>
            <Donut data={data?.by_type || {}}/>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl"/>
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold">Activity streak</h3>
                <Flame className="w-4 h-4 text-amber-400"/>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-heading text-5xl font-bold gradient-text">{data?.streak_days ?? 0}</span>
                <span className="text-xs text-gray-400 mb-2">days</span>
              </div>
              <Bars />
              <p className="text-xs text-gray-400 mt-3">Your weekly activity. Keep the momentum!</p>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-blue opacity-50"/>
          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-xs text-blue-300 mb-2"><Sparkles className="w-3.5 h-3.5"/>AI Insights</div>
              <h3 className="font-heading text-xl font-semibold mb-2">You're 3× more likely to win a hackathon if you apply this week</h3>
              <p className="text-sm text-gray-300">Based on your saved categories and skill mix, the upcoming KLE Tech Hack and Smart India Hackathon are strong fits — apply before Apr 12 for maximum impact.</p>
            </div>
            <div className="text-center md:text-right">
              <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/30">
                <div className="font-heading text-4xl font-bold gradient-text">87</div>
                <div className="text-xs text-gray-400 mt-1">career score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
