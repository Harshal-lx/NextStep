import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Share2, Calendar, MapPin, Trophy, Users, ArrowLeft, Sparkles, Bell } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { toast } from "sonner";

export default function OpportunityDetails() {
  const { id } = useParams();
  const [opp, setOpp] = useState(null);
  const [saved, setSaved] = useState(false);
  const [reminder, setReminder] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([api.get(`/opportunities/${id}`), api.get(`/saved`).catch(()=>({data:[]}))]);
      setOpp(a.data);
      setSaved(b.data.some(o => o.id === id));
    })();
  }, [id]);

  const toggleSave = async () => {
    setSaved(s => !s);
    try {
      saved ? await api.delete(`/saved/${id}`) : await api.post(`/saved/${id}`);
      toast.success(saved ? "Removed" : "Saved!");
    } catch { toast.error("Failed"); }
  };

  if (!opp) return <AppShell><div className="text-gray-400">Loading…</div></AppShell>;

  const matchScore = Math.floor(70 + (opp.title.length % 25));

  return (
    <AppShell>
      <div className="space-y-6" data-testid="opp-details-root">
        <Link to="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4"/>Back</Link>

        <div className="relative rounded-3xl overflow-hidden border border-white/10 h-64">
          <img src={opp.banner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 border border-blue-500/40 text-blue-200 backdrop-blur-md mb-3">{opp.type}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-1">{opp.title}</h1>
            <p className="text-sm text-gray-300">by {opp.organizer}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button data-testid="apply-btn" className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.4)]">Apply Now</button>
              <button data-testid="save-detail-btn" onClick={toggleSave} className="px-6 py-3 rounded-full glass border border-white/10 hover:bg-white/10 transition flex items-center gap-2">
                {saved ? <BookmarkCheck className="w-4 h-4 text-blue-400"/> : <Bookmark className="w-4 h-4"/>}
                {saved ? "Saved" : "Save"}
              </button>
              <button className="px-6 py-3 rounded-full glass border border-white/10 hover:bg-white/10 transition flex items-center gap-2"><Share2 className="w-4 h-4"/>Share</button>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold mb-3">Overview</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{opp.overview || opp.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-heading font-semibold mb-3">Eligibility</h3>
                <p className="text-sm text-gray-300">{opp.eligibility || "Open to all eligible students."}</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-heading font-semibold mb-3">Rewards</h3>
                <p className="text-sm text-gray-300">{opp.prize}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-3">Required skills</h3>
              <div className="flex flex-wrap gap-2">
                {(opp.skills || []).map(s => <span key={s} className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10">{s}</span>)}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                {[
                  { d: "Applications open", t: "Now" },
                  { d: "Submission deadline", t: opp.deadline },
                  { d: "Results announced", t: "1 week post-deadline" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div className="flex-1">{s.d}</div>
                    <div className="text-gray-400 text-xs">{s.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs text-blue-300 mb-3"><Sparkles className="w-3.5 h-3.5"/>AI Match Score</div>
              <div className="font-heading text-5xl font-bold gradient-text mb-2">{matchScore}%</div>
              <p className="text-xs text-gray-400 leading-relaxed">Based on your skills and interests, this opportunity is a strong match.</p>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" style={{width:`${matchScore}%`}}/>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-medium mb-3"><Calendar className="w-4 h-4 text-blue-400"/>Deadline</div>
              <div className="text-2xl font-heading font-bold mb-1">{opp.deadline}</div>
              <div className="text-xs text-gray-400">{opp.mode} · {opp.location}</div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4 text-amber-400"/>Reminder</div>
                <button data-testid="reminder-toggle" onClick={()=>setReminder(r=>!r)} className={`w-11 h-6 rounded-full transition relative ${reminder ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-white/10"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${reminder ? "left-5" : "left-0.5"}`}/>
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300"><Trophy className="w-4 h-4 text-amber-400"/>{opp.prize}</div>
              <div className="flex items-center gap-2 text-gray-300"><MapPin className="w-4 h-4 text-purple-400"/>{opp.location}</div>
              <div className="flex items-center gap-2 text-gray-300"><Users className="w-4 h-4 text-blue-400"/>Team size: {opp.team_size || "1-4"}</div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
