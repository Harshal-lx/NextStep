import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import OpportunityCard from "@/components/OpportunityCard";
import { api } from "@/api";
import { Bookmark } from "lucide-react";

export default function Saved() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api.get("/saved");
    setOpps(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleSave = async (opp) => {
    await api.delete(`/saved/${opp.id}`);
    setOpps((s) => s.filter(o => o.id !== opp.id));
  };

  return (
    <AppShell>
      <div className="space-y-6" data-testid="saved-root">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Saved opportunities</h1>
          <p className="text-sm text-gray-400">Your bookmarked picks, ready to apply.</p>
        </div>
        {loading ? <div className="grid md:grid-cols-3 gap-5">{Array.from({length:3}).map((_,i)=>(<div key={i} className="glass rounded-2xl h-72 animate-pulse"/>))}</div>
          : opps.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <Bookmark className="w-10 h-10 mx-auto mb-4 text-blue-400 opacity-60"/>
              <h3 className="font-heading text-xl font-semibold mb-2">No saved opportunities yet</h3>
              <p className="text-sm text-gray-400">Click the bookmark icon on any opportunity to save it here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {opps.map(o => <OpportunityCard key={o.id} opp={o} saved onToggleSave={toggleSave}/>)}
            </div>
          )}
      </div>
    </AppShell>
  );
}
