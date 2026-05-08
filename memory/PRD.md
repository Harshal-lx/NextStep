# NextStep — Product Requirements Doc

## Original problem statement
Build a futuristic, AI-powered EdTech web platform called NextStep that helps Indian students discover and track opportunities (hackathons, internships, scholarships, contests, fellowships, workshops). Premium, glassmorphic, dark navy aesthetic. AI mentor + recommendations + analytics. 12 pages.

## Tech stack
- Frontend: React 19 + Tailwind + shadcn/ui + framer-motion + lucide-react
- Backend: FastAPI + Motor (async MongoDB)
- AI: Claude Sonnet 4.5 via emergentintegrations + Emergent LLM key
- Auth: Emergent-managed Google OAuth (students) + username/password (admin)

## User personas
- **Student** — undergrad/grad in India, looking for hackathons, internships, scholarships
- **Admin (BLUELOCKZ)** — manages opportunities, sees platform analytics

## Implemented (Feb 2026)
- ✅ Landing page (hero, features, how-it-works, opportunities preview, testimonials, footer)
- ✅ Student auth via Emergent Google OAuth (`/auth`)
- ✅ Separate Admin login (`/admin-login` — username/password)
- ✅ 4-step onboarding wizard
- ✅ Dashboard (welcome banner, stats, recommended grid, AI panel, deadlines timeline)
- ✅ Opportunities list with type + location filters + free-text city search
- ✅ Opportunity Details page with AI Match score
- ✅ Saved (Pinterest-style)
- ✅ AI Mentor chat (Claude Sonnet 4.5, persistent history)
- ✅ Calendar with deadlines and upcoming events
- ✅ Personal Analytics page (profile completeness ring, type donut, weekly bars, AI insight)
- ✅ Notifications page
- ✅ Profile page (editable, career readiness bar)
- ✅ Admin panel (stats, add/delete opportunities) — protected by role
- ✅ 12 India-focused seed opportunities (KLE Tech Hack BVB Hubballi, SIH, TCS CodeVita, Flipkart GRiD, IIT Bombay Techfest, Inspire MANAK, Reliance Foundation, Adobe Women-in-Tech, NPTEL, PM YUVA, GSoC India, Microsoft Engage)

## Removed
- ❌ Team Finder (per user request)

## Test results
- Backend: 28/28 tests pass (admin auth, opportunities, analytics, saved CRUD, AI chat, role guards)
- Frontend: 8/8 critical flows pass (admin login, redirects, sidebar, analytics, opportunities, location filter)

## Backlog (P1/P2)
- P1: Resume upload + AI resume scoring (currently mocked)
- P1: Google Calendar sync (UI exists, integration pending)
- P1: Real notifications generation (currently uses fallback array on empty DB)
- P2: Admin: edit existing opportunity (currently delete + recreate)
- P2: Admin: user management table
- P2: Email reminders for upcoming deadlines (Resend integration)
- P2: Mobile bottom nav (sidebar hides on mobile)
- P2: Backend pagination + location regex for opportunities

## Credentials
See `/app/memory/test_credentials.md`.
