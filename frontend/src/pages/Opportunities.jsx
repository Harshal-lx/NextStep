import { useEffect, useMemo, useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import AppShell from "@/components/AppShell";
import OpportunityCard from "@/components/OpportunityCard";
import { api } from "@/api";
import { toast } from "sonner";

const TYPES = ["all", "hackathon", "internship", "scholarship", "contest", "fellowship", "bootcamp", "workshop"];
const LOCATIONS = ["all", "Pan-India", "Online (India)", "Hubballi", "Bengaluru", "Mumbai", "Hyderabad", "New Delhi", "Noida", "Remote — India"];

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [type, setType] = useState("all");
  const [loc, setLoc] = useState("all");
  const [q, setQ] = useState("");
  const [locQuery, setLocQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([api.get("/opportunities"), api.get("/saved")]);
        setOpps(a.data);
        setSavedIds(new Set(b.data.map(o => o.id)));
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    return opps.filter(o => {
      if (type !== "all" && o.type !== type) return false;
      if (loc !== "all" && !(o.location || "").toLowerCase().includes(loc.toLowerCase())) return false;
      if (locQuery && !(o.location || "").toLowerCase().includes(locQuery.toLowerCase())) return false;
      if (q && !o.title.toLowerCase().includes(q.toLowerCase()) && !o.organizer.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [opps, type, loc, q, locQuery]);

  const toggleSave = async (opp) => {
    const isSaved = savedIds.has(opp.id);
    setSavedIds((s) => { const ns = new Set(s); isSaved ? ns.delete(opp.id) : ns.add(opp.id); return ns; });
    try {
      isSaved ? await api.delete(`/saved/${opp.id}`) : await api.post(`/saved/${opp.id}`);
    } catch { toast.error("Failed"); }
  };

  return (
    <AppShell>
      <div className="space-y-6" data-testid="opportunities-root">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Explore opportunities</h1>
          <p className="text-sm text-gray-400">Hackathons, internships, scholarships, and more — curated for Indian students.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input data-testid="opps-search" value={q} onChange={(e)=>setQ(e.target.value)}
              placeholder="Search title or organizer…"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/40" />
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input data-testid="opps-location-search" value={locQuery} onChange={(e)=>setLocQuery(e.target.value)}
              placeholder="Filter by city e.g., Hubballi, Bengaluru, Mumbai…"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/40" />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-2">Type</div>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button key={t} data-testid={`filter-type-${t}`} onClick={()=>setType(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition capitalize ${type === t ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-purple-400 mb-2">Location</div>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(l => (
                <button key={l} data-testid={`filter-loc-${l}`} onClick={()=>setLoc(l)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${loc === l ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                  {l === "all" ? "All locations" : l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">{filtered.length} opportunities</div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? Array.from({length:6}).map((_,i)=>(<div key={i} className="glass rounded-2xl h-80 animate-pulse"/>))
            : filtered.length ? filtered.map(o => <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={toggleSave}/>)
            : <div className="col-span-full text-center text-gray-400 py-20"><Filter className="w-8 h-8 mx-auto mb-3 opacity-50"/>No opportunities match your filters.</div>}
        </div>
      </div>
    </AppShell>
  );
}
