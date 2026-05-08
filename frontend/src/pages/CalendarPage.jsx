import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const [opps, setOpps] = useState([]);
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => { api.get("/opportunities").then(r => setOpps(r.data)); }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = Array.from({ length: startPad }).map(() => null)
    .concat(Array.from({ length: last.getDate() }, (_, i) => i + 1));

  const oppsByDate = opps.reduce((acc, o) => {
    const d = new Date(o.deadline);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      acc[key] = (acc[key] || []).concat(o);
    }
    return acc;
  }, {});

  const upcoming = opps.filter(o => new Date(o.deadline) >= new Date()).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,8);

  return (
    <AppShell>
      <div className="space-y-6" data-testid="calendar-root">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Calendar</h1>
          <p className="text-sm text-gray-400">All your opportunity deadlines in one view.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CalIcon className="w-5 h-5 text-blue-400"/>
                <h2 className="font-heading text-xl font-semibold">{MONTHS[month]} {year}</h2>
              </div>
              <div className="flex gap-1">
                <button onClick={()=>setCursor(new Date(year, month-1, 1))} className="w-9 h-9 rounded-full glass hover:bg-white/10"><ChevronLeft className="w-4 h-4 mx-auto"/></button>
                <button onClick={()=>setCursor(new Date(year, month+1, 1))} className="w-9 h-9 rounded-full glass hover:bg-white/10"><ChevronRight className="w-4 h-4 mx-auto"/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-gray-500 text-center">
              {DAYS.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => (
                <div key={i} className={`aspect-square p-2 rounded-lg ${d ? "bg-white/[0.02] hover:bg-white/[0.06] border border-white/5" : ""}`}>
                  {d && (
                    <>
                      <div className="text-xs text-gray-300">{d}</div>
                      {oppsByDate[d] && (
                        <div className="mt-1 space-y-0.5">
                          {oppsByDate[d].slice(0,2).map(o => (
                            <div key={o.id} className="text-[9px] truncate px-1 py-0.5 rounded bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/30">{o.title}</div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-semibold mb-4">Upcoming events</h3>
            <div className="space-y-3">
              {upcoming.map(o => (
                <Link to={`/opportunities/${o.id}`} key={o.id} className="flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex flex-col items-center justify-center text-[10px]">
                    <span className="text-gray-400">{MONTHS[new Date(o.deadline).getMonth()].slice(0,3)}</span>
                    <span className="font-bold text-white">{new Date(o.deadline).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{o.title}</div>
                    <div className="text-xs text-gray-500">{o.organizer}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
