import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Plus, Trash2, Users, FileText, TrendingUp, Folder } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [stats, setStats] = useState({ total_users: 0, total_opportunities: 0, total_saved: 0 });
  const [opps, setOpps] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", organizer: "", type: "hackathon", description: "", deadline: "", prize: "", skills: "" });

  const load = async () => {
    const [s, o] = await Promise.all([api.get("/admin/stats").catch(()=>({data:stats})), api.get("/opportunities")]);
    setStats(s.data); setOpps(o.data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/opportunities", {
        ...form,
        skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
        banner: "https://images.unsplash.com/photo-1639322537138-5e513100b36e?w=1200",
      });
      toast.success("Opportunity created");
      setCreating(false);
      setForm({ title: "", organizer: "", type: "hackathon", description: "", deadline: "", prize: "", skills: "" });
      load();
    } catch { toast.error("Create failed"); }
  };

  const remove = async (id) => {
    try { await api.delete(`/opportunities/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const cards = [
    { label: "Total users", value: stats.total_users, icon: Users },
    { label: "Total opportunities", value: stats.total_opportunities, icon: Folder },
    { label: "Total saves", value: stats.total_saved, icon: FileText },
    { label: "Top category", value: "Hackathon", icon: TrendingUp },
  ];

  return (
    <AppShell>
      <div className="space-y-6" data-testid="admin-root">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">Manage opportunities and view analytics.</p>
          </div>
          <button data-testid="admin-add-btn" onClick={()=>setCreating(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium flex items-center gap-2 hover:scale-105 transition">
            <Plus className="w-4 h-4"/>Add opportunity
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="glass rounded-2xl p-5">
              <c.icon className="w-5 h-5 text-blue-400 mb-3"/>
              <div className="font-heading text-3xl font-bold">{c.value}</div>
              <div className="text-xs text-gray-400">{c.label}</div>
            </div>
          ))}
        </div>

        {creating && (
          <form onSubmit={create} className="glass-strong rounded-2xl p-6 space-y-3" data-testid="admin-create-form">
            <h3 className="font-heading font-semibold mb-2">New opportunity</h3>
            {["title","organizer","deadline","prize"].map(k => (
              <input key={k} required={k!=="prize"} placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
            ))}
            <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
              {["hackathon","internship","scholarship","contest","fellowship","bootcamp","workshop"].map(t => <option key={t} value={t} className="bg-[#0B1020]">{t}</option>)}
            </select>
            <textarea required placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none"/>
            <input placeholder="skills (comma separated)" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium">Create</button>
              <button type="button" onClick={()=>setCreating(false)} className="px-5 py-2 rounded-full glass border-white/10 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 font-heading font-semibold">All opportunities</div>
          <div className="divide-y divide-white/5">
            {opps.map(o => (
              <div key={o.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold">{o.type[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.title}</div>
                  <div className="text-xs text-gray-500">{o.organizer} · {o.deadline}</div>
                </div>
                <button data-testid={`admin-delete-${o.id}`} onClick={()=>remove(o.id)} className="w-9 h-9 rounded-full glass hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
