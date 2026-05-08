import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Bell, FileSearch, Users, Compass, CalendarDays,
  ArrowRight, Star, ChevronRight, Github, Twitter, Linkedin
} from "lucide-react";
import FloatingBg from "@/components/FloatingBg";

const features = [
  { icon: Sparkles, title: "AI Recommendations", desc: "Personalized opportunity matches powered by Claude Sonnet 4.5." },
  { icon: Bell, title: "Deadline Reminders", desc: "Never miss an application — smart timeline alerts." },
  { icon: FileSearch, title: "Resume Matching", desc: "AI scores your resume against every opportunity." },
  { icon: Users, title: "Team Finder", desc: "Find hackathon teammates by skills & interests." },
  { icon: Compass, title: "Opportunity Tracking", desc: "One dashboard for every application & status." },
  { icon: CalendarDays, title: "Smart Calendar", desc: "Sync deadlines with Google Calendar in one click." },
];

const steps = [
  { n: "01", title: "Create your profile", desc: "Sign in with Google in seconds — your AI roadmap starts forming." },
  { n: "02", title: "Select skills & interests", desc: "Pick your branch, interests, and skill level for tailored picks." },
  { n: "03", title: "Get personalized opportunities", desc: "We surface hackathons, internships, scholarships you'll actually win." },
];

const livePreview = [
  { type: "hackathon", title: "KLE Tech Hack 2026", org: "BVB Hubballi", deadline: "Apr 12", prize: "₹3,00,000" },
  { type: "hackathon", title: "Smart India Hackathon", org: "Govt. of India", deadline: "May 20", prize: "₹1,00,000" },
  { type: "internship", title: "GSoC India", org: "Google", deadline: "Mar 30", prize: "USD 3,000" },
  { type: "scholarship", title: "Reliance Foundation", org: "Reliance", deadline: "Jul 1", prize: "₹6,00,000" },
];

const testimonials = [
  { name: "Aanya Sharma", uni: "IIT Bombay", text: "Landed my Microsoft Engage internship through a NextStep recommendation. The AI mentor felt like a senior friend.", rating: 5 },
  { name: "Rohan Kulkarni", uni: "KLE Tech, Hubballi", text: "Won my first hackathon at KLE Tech Hack with a roadmap NextStep generated for me. The match score was scary accurate.", rating: 5 },
  { name: "Priya Patel", uni: "BITS Pilani", text: "Finally a productivity dashboard that doesn't feel like a chore. SIH applications have never been easier.", rating: 5 },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FloatingBg />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 px-6 md:px-12 py-4 backdrop-blur-xl bg-[#0B1020]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-heading font-bold glow-blue">N</div>
            <span className="font-heading font-bold text-lg tracking-tight">NextStep</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#opportunities" className="hover:text-white transition">Opportunities</a>
            <a href="#how" className="hover:text-white transition">How it Works</a>
            <a href="#testimonials" className="hover:text-white transition">Stories</a>
          </div>
          <Link to="/auth" data-testid="navbar-login-btn" className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition">
            Sign in
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-12 pt-20 pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Claude Sonnet 4.5
            </span>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-6">
              Your <span className="gradient-text">Next Big Opportunity</span><br />Starts Here.
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mb-8 leading-relaxed">
              Discover hackathons, internships, scholarships, contests, and career-defining moments — curated for you by AI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" data-testid="hero-get-started-btn" className="px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 transition flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#opportunities" data-testid="hero-explore-btn" className="px-7 py-3.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium hover:bg-white/10 transition">
                Explore Opportunities
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 text-xs text-gray-500">
              <div><span className="text-white font-semibold text-base">12,000+</span> Indian students</div>
              <div className="w-px h-6 bg-white/10" />
              <div><span className="text-white font-semibold text-base">3,500+</span> opportunities</div>
              <div className="w-px h-6 bg-white/10" />
              <div><span className="text-white font-semibold text-base">96%</span> match accuracy</div>
            </div>
          </motion.div>

          {/* Hero Mockup */}
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.2}} className="lg:col-span-5 relative">
            <div className="relative rounded-3xl glass-strong p-5 shadow-[0_0_60px_rgba(59,130,246,0.25)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
              </div>
              <div className="space-y-3">
                {livePreview.slice(0,3).map((c,i) => (
                  <motion.div key={i} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.15}}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                      {c.type[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                      <div className="text-xs text-gray-500">{c.org} · {c.deadline}</div>
                    </div>
                    <span className="text-xs text-blue-300">{c.prize}</span>
                  </motion.div>
                ))}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/20 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-white">AI suggests: <span className="gradient-text">3 new matches</span></div>
                    <div className="text-xs text-gray-400">Based on your Python + ML profile</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 backdrop-blur-md animate-float-slow">
              ● Live · 12 new today
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Features</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-3 mb-4">Built for the next generation of builders</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to find, track, and win opportunities — in one beautifully crafted workspace.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f,i) => (
              <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
                className="glass card-hover p-7 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">How it works</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-3 mb-4">Three steps to your next break</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            {steps.map((s,i) => (
              <div key={s.n} className="glass card-hover p-7 rounded-2xl relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-heading font-bold mb-4 glow-blue">
                  {s.n}
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE OPPORTUNITIES */}
      <section id="opportunities" className="px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Trending Now</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-3">Live opportunities</h2>
            </div>
            <Link to="/auth" className="text-sm text-blue-300 hover:text-blue-200 inline-flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {livePreview.map((c,i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}}
                className="glass card-hover rounded-2xl p-5">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-4">
                  {c.type}
                </span>
                <h3 className="font-heading font-semibold text-lg mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{c.org}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">📅 {c.deadline}</span>
                  <span className="text-blue-300 font-semibold">{c.prize}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">Stories</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mt-3">Loved by ambitious students</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t,i) => (
              <div key={i} className="glass card-hover p-7 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {Array.from({length:t.rating}).map((_,k)=> <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400"/> )}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.uni}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto glass-strong rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-blue opacity-60" />
          <div className="relative">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">Your career, on autopilot.</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">Join 12,000+ Indian students using NextStep to land internships, win SIH, and earn scholarships.</p>
            <Link to="/auth" data-testid="cta-signup-btn" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition">
              Get started — it's free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-heading font-bold">N</div>
              <span className="font-heading font-bold text-lg">NextStep</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">AI-powered opportunity discovery for ambitious students.</p>
            <div className="flex gap-3">
              <a className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10"><Twitter className="w-4 h-4"/></a>
              <a className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10"><Github className="w-4 h-4"/></a>
              <a className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10"><Linkedin className="w-4 h-4"/></a>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a className="hover:text-white" href="#features">Features</a></li>
              <li><a className="hover:text-white" href="#opportunities">Opportunities</a></li>
              <li><a className="hover:text-white" href="#how">How it works</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a className="hover:text-white" href="#">About</a></li>
              <li><a className="hover:text-white" href="#">Contact</a></li>
              <li><a className="hover:text-white" href="#">Privacy</a></li>
              <li><a className="hover:text-white" href="#">Terms</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3">Stay updated</div>
            <p className="text-sm text-gray-500 mb-3">Weekly digest of trending opportunities.</p>
            <div className="flex gap-2">
              <input data-testid="footer-newsletter-input" placeholder="you@uni.edu" className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"/>
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-xs text-gray-600 flex flex-wrap justify-between gap-2">
          <span>© 2026 NextStep. Built for ambitious Indian students.</span>
          <div className="flex items-center gap-4">
            <Link to="/admin-login" className="text-gray-600 hover:text-purple-300" data-testid="footer-admin-link">Admin</Link>
            <span>Made with ⚡ + AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
