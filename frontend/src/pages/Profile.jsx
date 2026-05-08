import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Save, Award, FileText, Trophy } from "lucide-react";

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [form, setForm] = useState({ name: "", college: "", branch: "", bio: "", skills: "", interests: "", career_goals: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        college: user.college || "",
        branch: user.branch || "",
        bio: user.bio || "",
        skills: (user.skills || []).join(", "),
        interests: (user.interests || []).join(", "),
        career_goals: user.career_goals || "",
      });
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profile", {
        ...form,
        skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
        interests: form.interests.split(",").map(s=>s.trim()).filter(Boolean),
      });
      await checkAuth();
      toast.success("Profile updated");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const readiness = Math.min(100, ((user?.skills?.length || 0) * 8 + (user?.interests?.length || 0) * 5 + (user?.bio ? 20 : 0) + (user?.onboarded ? 25 : 0)));

  return (
    <AppShell>
      <div className="max-w-4xl space-y-6" data-testid="profile-root">
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full"/>
          <div className="relative flex items-center gap-5">
            {user?.picture ? <img src={user.picture} className="w-20 h-20 rounded-2xl border border-white/10"/> :
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">{(user?.name||"U")[0]}</div>}
            <div className="flex-1">
              <h1 className="font-heading text-3xl font-bold">{user?.name}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-300 mt-1">{user?.branch} · {user?.skill_level}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-semibold mb-3">Career Readiness</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{width:`${readiness}%`}}/>
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">{readiness}%</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-heading font-semibold">Edit profile</h3>
          {[
            { k: "name", label: "Name" },
            { k: "college", label: "College" },
            { k: "branch", label: "Branch" },
            { k: "bio", label: "Bio", textarea: true },
            { k: "skills", label: "Skills (comma separated)" },
            { k: "interests", label: "Interests (comma separated)" },
            { k: "career_goals", label: "Career goals", textarea: true },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs text-gray-400 block mb-1.5">{f.label}</label>
              {f.textarea ? (
                <textarea data-testid={`profile-${f.k}`} value={form[f.k]} onChange={(e)=>setForm({...form,[f.k]:e.target.value})}
                  rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none"/>
              ) : (
                <input data-testid={`profile-${f.k}`} value={form[f.k]} onChange={(e)=>setForm({...form,[f.k]:e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"/>
              )}
            </div>
          ))}
          <button data-testid="profile-save-btn" onClick={save} disabled={saving}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium flex items-center gap-2 hover:scale-105 transition disabled:opacity-50">
            <Save className="w-4 h-4"/>{saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Award, title: "Achievements", val: "12" },
            { icon: FileText, title: "Resume Score", val: "84%" },
            { icon: Trophy, title: "Applied", val: "14" },
          ].map(s => (
            <div key={s.title} className="glass card-hover rounded-2xl p-5">
              <s.icon className="w-5 h-5 text-blue-400 mb-3"/>
              <div className="font-heading text-2xl font-bold">{s.val}</div>
              <div className="text-xs text-gray-400">{s.title}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
