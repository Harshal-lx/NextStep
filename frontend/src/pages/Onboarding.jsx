import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import FloatingBg from "@/components/FloatingBg";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const BRANCHES = ["CSE", "AI/ML", "Cybersecurity", "ECE", "Mechanical", "MBA", "Design", "Other"];
const INTERESTS = ["Hackathons", "Internships", "Research", "Open Source", "Web Development", "AI", "Cybersecurity", "Blockchain"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState("");
  const [interests, setInterests] = useState([]);
  const [level, setLevel] = useState("");
  const [goals, setGoals] = useState("");
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const total = 4;
  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const toggleInterest = (i) => setInterests((arr) => arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/profile/onboarding", {
        branch, interests, skill_level: level, career_goals: goals,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      await checkAuth();
      toast.success("Profile saved! Generating your AI roadmap…");
      navigate("/dashboard");
    } catch (e) {
      toast.error("Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <FloatingBg />
      <div className="relative w-full max-w-2xl">
        {/* progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-white/10"}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-strong rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Step {step} of {total}
          </div>

          {step === 1 && (
            <div data-testid="onboarding-step-1">
              <h2 className="font-heading text-3xl font-bold mb-2">What's your branch?</h2>
              <p className="text-sm text-gray-400 mb-8">We'll personalize opportunities to your field.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BRANCHES.map((b) => (
                  <button key={b} data-testid={`branch-${b}`} onClick={() => setBranch(b)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition ${branch === b ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div data-testid="onboarding-step-2">
              <h2 className="font-heading text-3xl font-bold mb-2">Pick your interests</h2>
              <p className="text-sm text-gray-400 mb-8">Choose as many as you like.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <button key={i} data-testid={`interest-${i}`} onClick={() => toggleInterest(i)}
                    className={`px-4 py-2 rounded-full text-sm border transition flex items-center gap-2 ${interests.includes(i) ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white" : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"}`}>
                    {interests.includes(i) && <Check className="w-3.5 h-3.5" />}
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <h2 className="font-heading text-3xl font-bold mb-2">What's your skill level?</h2>
              <p className="text-sm text-gray-400 mb-8">Helps us recommend the right difficulty.</p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {LEVELS.map((l) => (
                  <button key={l} data-testid={`level-${l}`} onClick={() => setLevel(l)}
                    className={`p-5 rounded-xl text-sm font-medium border transition ${level === l ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <label className="text-sm text-gray-300 mb-2 block">Your top skills (comma separated)</label>
              <input data-testid="skills-input" value={skills} onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, Figma, Public Speaking"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
          )}

          {step === 4 && (
            <div data-testid="onboarding-step-4">
              <h2 className="font-heading text-3xl font-bold mb-2">What are your goals?</h2>
              <p className="text-sm text-gray-400 mb-8">Be specific — your AI mentor will use this.</p>
              <textarea data-testid="goals-input" value={goals} onChange={(e) => setGoals(e.target.value)}
                rows={6} placeholder="e.g., Land a SWE internship at a top tech company by summer 2026, win 1 AI hackathon."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
          )}

          <div className="flex items-center justify-between mt-10">
            <button data-testid="onboarding-back-btn" onClick={back} disabled={step === 1}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
              ← Back
            </button>
            {step < total ? (
              <button data-testid="onboarding-next-btn" onClick={next}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium flex items-center gap-2 hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button data-testid="onboarding-submit-btn" onClick={submit} disabled={submitting}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium flex items-center gap-2 hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50">
                <Sparkles className="w-4 h-4" /> {submitting ? "Generating…" : "Generate My AI Roadmap"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
