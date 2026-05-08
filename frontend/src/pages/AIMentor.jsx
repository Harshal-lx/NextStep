import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PROMPTS = [
  "What hackathons match my profile?",
  "Build me a 6-month roadmap to a SWE internship.",
  "What skills should I learn next?",
  "Review my application strategy.",
];

export default function AIMentor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/ai/history").then(r => setMessages(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const r = await api.post("/ai/chat", { message: msg });
      setMessages(m => [...m, { role: "assistant", content: r.data.reply }]);
    } catch (e) {
      toast.error("AI mentor is unavailable. Try again.");
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col" data-testid="ai-mentor-root">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2"><Sparkles className="w-3.5 h-3.5"/>Claude Sonnet 4.5</div>
          <h1 className="font-heading text-3xl font-bold mb-1">AI Mentor</h1>
          <p className="text-sm text-gray-400">Your personal career copilot. Ask anything.</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 && !loading && (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 glow-blue">
                <Sparkles className="w-6 h-6"/>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-400 mb-6">Try one of these to get started:</p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {PROMPTS.map((p,i)=>(
                  <button key={i} data-testid={`prompt-${i}`} onClick={()=>send(p)}
                    className="text-left text-sm p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/8 transition">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${m.role === "user" ? "bg-white/10" : "bg-gradient-to-br from-blue-500 to-purple-600"}`}>
                {m.role === "user" ? "You" : <Sparkles className="w-4 h-4"/>}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30" : "glass border-white/10"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4"/></div>
              <div className="glass border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-400 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin"/>Thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e)=>{e.preventDefault();send();}} className="glass-strong rounded-2xl p-3 flex items-center gap-2">
          <input data-testid="ai-input" value={input} onChange={(e)=>setInput(e.target.value)}
            placeholder="Ask your AI mentor anything…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-500 px-3"/>
          <button data-testid="ai-send-btn" type="submit" disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center disabled:opacity-40 hover:scale-105 transition">
            <Send className="w-4 h-4"/>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
