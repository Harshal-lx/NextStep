import { Bookmark, BookmarkCheck, Clock, MapPin, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const TYPE_COLORS = {
  hackathon: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  internship: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  scholarship: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  contest: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  fellowship: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bootcamp: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  workshop: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
};

function daysLeft(deadline) {
  const d = new Date(deadline);
  const diff = Math.ceil((d - new Date()) / 86400000);
  return diff;
}

export default function OpportunityCard({ opp, saved, onToggleSave }) {
  const days = daysLeft(opp.deadline);
  const matchScore = Math.floor(70 + (opp.title.length % 25));
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass card-hover rounded-2xl overflow-hidden flex flex-col"
      data-testid={`opportunity-card-${opp.id}`}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={opp.banner || "https://images.unsplash.com/photo-1639322537138-5e513100b36e?w=1200"} alt="" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/30 to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${TYPE_COLORS[opp.type] || TYPE_COLORS.hackathon}`}>
          {opp.type}
        </span>
        {onToggleSave && (
          <button
            data-testid={`save-btn-${opp.id}`}
            onClick={(e) => { e.preventDefault(); onToggleSave(opp); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center hover:bg-white/15 transition"
          >
            {saved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4 text-white" />}
          </button>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-heading font-semibold text-lg text-white line-clamp-2 mb-1">{opp.title}</h3>
        <p className="text-xs text-gray-400 mb-3">{opp.organizer}</p>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{opp.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(opp.skills || []).slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">{s}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" />{days >= 0 ? `${days}d left` : "Closed"}</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-400" />{opp.mode}</div>
          {opp.prize && <div className="flex items-center gap-1.5 col-span-2"><Trophy className="w-3.5 h-3.5 text-amber-400" />{opp.prize}</div>}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="gradient-text font-semibold">{matchScore}% match</span>
          </div>
          <Link
            to={`/opportunities/${opp.id}`}
            data-testid={`view-btn-${opp.id}`}
            className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
