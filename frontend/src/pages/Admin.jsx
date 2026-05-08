import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Plus, Trash2, Users, FileText, TrendingUp, Folder, Wand2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const TYPES = ["hackathon","internship","scholarship","contest","fellowship","bootcamp","workshop"];

const EMPTY = { title:"", organizer:"", type:"hackathon", description:"", deadline:"", prize:"", skills:"", apply_url:"", eligibility:"", location:"India", mode:"Online", banner:"" };

export default function Admin() {
  const [stats, setStats] = useState({ total_users: 0, total_opportunities: 0, total_saved: 0 });
  const [opps, setOpps] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  const load = async () => {
    const [s, o] = await Promise.all([api.get("/admin/stats").catch(()=>({data:stats})), api.get("/opportunities")]);
    setStats(s.data); setOpps(o.data);
  };
  useEffect(() => { load(); }, []);

  const importFromUrl = async () => {
    if (!scrapeUrl.trim()) return toast.error("Paste an opportunity URL first");
    setScraping(true);
    try {
      const r = await api.post("/scrape-opportunity", { url: scrapeUrl.trim() });
      const d = r.data || {};
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        organizer: d.organizer || f.organizer,
        deadline: d.deadline && d.deadline !== "TBD" ? d.deadline.slice(0,10) : f.deadline,
        eligibility: d.eligibility || f.eligibility,
        prize: d.prize || f.prize,
        apply_url: d.apply_link && d.apply_link !== "TBD" ? d.apply_link : (scrapeUrl.trim() || f.apply_url),
        description: f.description || (d.eligibility ? `${d.title} — ${d.eligibility}` : ""),
      }));
      setCreating(true);
      toast.success("AI extracted the opportunity. Review and save.");
    } catch (e) {
      const detail = e?.response?.data?.detail || "Scrape failed";
      toast.error(detail);
    } finally { setScraping(false); }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/opportunities", {
        ...form,
        skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
        apply_url: form.apply_url || "#",
        banner: form.banner || "https://images.unsplash.com/photo-1639322537138-5e513100b36e?w=1200",
      });
      toast.success("Opportunity created");
      setCreating(false); setForm(EMPTY); setScrapeUrl("");
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
    { label: "Top category", value: Object.entries(stats.by_type || {}).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—", icon: TrendingUp },
  ];

  return (
    <AppShell>
      <div className="space-y-6" data-testid="admin-root">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Console</h1>
            <p className="text-sm text-gray-400">Manage opportunities, import from URLs, view analytics.</p>
          </div>
          <button data-testid="admin-add-btn" onClick={()=>{setForm(EMPTY); setCreating(true);}}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium flex items-center gap-2 hover:scale-105 transition">
            <Plus className="w-4 h-4"/>Add manually
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="glass rounded-2xl p-5">
              <c.icon className="w-5 h-5 text-blue-400 mb-3"/>
              <div className="font-heading text-3xl font-bold capitalize">{c.value}</div>
              <div className="text-xs text-gray-400">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Import from URL */}
        <div className="glass-strong rounded-2xl p-6 relative overflow-hidden" data-testid="admin-import-card">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl"/>
          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-purple-300 mb-2"><Wand2 className="w-3.5 h-3.5"/>AI Smart Import</div>
            <h3 className="font-heading text-xl font-semibold mb-1">Import opportunity from any URL</h3>
            <p className="text-sm text-gray-400 mb-4">Paste a hackathon, internship or scholarship link — Claude Sonnet 4.5 will extract title, organizer, deadline, eligibility, prize, and apply link.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                data-testid="scrape-url-input"
                value={scrapeUrl}
                onChange={(e)=>setScrapeUrl(e.target.value)}
                placeholder="https://unstop.com/hackathon/... or https://devfolio.co/..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50"
              />
              <button
                data-testid="scrape-import-btn"
                onClick={importFromUrl}
                disabled={scraping}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-medium hover:scale-105 transition disabled:opacity-50 flex items-center gap-2 justify-center"
              >
                {scraping ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
                {scraping ? "Extracting…" : "Import & prefill"}
              </button>
            </div>
          </div>
        </div>

        {creating && (
          <form onSubmit={create} className="glass-strong rounded-2xl p-6 space-y-3" data-testid="admin-create-form">
            <h3 className="font-heading font-semibold mb-2">New opportunity</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                ["title","Title", true],
                ["organizer","Organizer", true],
                ["deadline","Deadline (YYYY-MM-DD)", true],
                ["prize","Prize", false],
                ["location","Location", false],
                ["apply_url","Apply URL", false],
              ].map(([k,label,req]) => (
                <div key={k}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input data-testid={`form-${k}`} required={req} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Type</label>
                <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                  {TYPES.map(t => <option key={t} value={t} className="bg-[#0B1020]">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Mode</label>
                <select value={form.mode} onChange={(e)=>setForm({...form,mode:e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                  {["Online","Offline","Hybrid"].map(t => <option key={t} value={t} className="bg-[#0B1020]">{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Eligibility</label>
              <input data-testid="form-eligibility" value={form.eligibility} onChange={(e)=>setForm({...form,eligibility:e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Description</label>
              <textarea required data-testid="form-description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Skills (comma separated)</label>
              <input data-testid="form-skills" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
            </div>
            <div className="flex gap-3">
              <button type="submit" data-testid="admin-create-submit" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium">Create</button>
              <button type="button" onClick={()=>setCreating(false)} className="px-5 py-2 rounded-full glass border-white/10 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 font-heading font-semibold">All opportunities ({opps.length})</div>
          <div className="divide-y divide-white/5">
            {opps.map(o => (
              <div key={o.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold capitalize">{o.type[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.title}</div>
                  <div className="text-xs text-gray-500 truncate">{o.organizer} · {o.deadline} · {o.location}</div>
                </div>
                {o.apply_url && o.apply_url !== "#" && (
                  <a href={o.apply_url} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex text-xs text-blue-300 items-center gap-1 hover:text-blue-200">
                    Apply <ExternalLink className="w-3 h-3"/>
                  </a>
                )}
                <button data-testid={`admin-delete-${o.id}`} onClick={()=>remove(o.id)} className="w-9 h-9 rounded-full glass hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
