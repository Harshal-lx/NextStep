import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Bell, Sparkles, Users, Trophy, Clock } from "lucide-react";

const ICONS = { deadline: Clock, ai: Sparkles, team: Users, scholarship: Trophy, event: Bell };
const COLORS = {
  deadline: "from-rose-500 to-amber-500",
  ai: "from-blue-500 to-purple-600",
  team: "from-emerald-500 to-cyan-500",
  scholarship: "from-amber-500 to-orange-500",
  event: "from-indigo-500 to-blue-500",
};

const FALLBACK = [
  { id: "n1", type: "ai", title: "3 new AI matches for you", body: "Based on your interest in ML, we found 3 new hackathons.", read: false },
  { id: "n2", type: "deadline", title: "Google Internship deadline in 3 days", body: "Don't forget to submit your application by Mar 30.", read: false },
  { id: "n3", type: "team", title: "Aanya invited you to her team", body: "Aanya wants you to join her AI Hackathon 2026 team.", read: true },
  { id: "n4", type: "scholarship", title: "New scholarship: Women in Tech $10k", body: "Applications now open until Jun 1.", read: true },
  { id: "n5", type: "event", title: "Your saved event 'Figma Workshop' starts tomorrow", body: "Set a reminder to not miss it.", read: true },
];

export default function Notifications() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/notifications").then(r => setItems(r.data.length ? r.data : FALLBACK)).catch(() => setItems(FALLBACK));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl" data-testid="notifications-root">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Notifications</h1>
          <p className="text-sm text-gray-400">Stay on top of every deadline and update.</p>
        </div>
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div key={n.id} className={`glass rounded-2xl p-5 flex gap-4 ${!n.read ? "border-blue-500/30" : ""}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[n.type] || COLORS.event} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" strokeWidth={1.8}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400 pulse-ring"/>}
                  </div>
                  <p className="text-sm text-gray-400">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
