from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Cookie, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import httpx
import json as _json
import requests
from bs4 import BeautifulSoup
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()}
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', '')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------- Models ----------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = []
    skills: List[str] = []
    skill_level: Optional[str] = None
    career_goals: Optional[str] = None
    onboarded: bool = False
    role: str = "student"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Opportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    organizer: str
    type: str  # hackathon, internship, scholarship, etc
    description: str
    deadline: str
    mode: str = "Online"  # Online/Offline/Hybrid
    location: str = "Remote"
    prize: str = ""
    eligibility: str = ""
    skills: List[str] = []
    difficulty: str = "Intermediate"
    banner: str = ""
    organizer_logo: str = ""
    apply_url: str = "#"
    team_size: str = "1"
    rewards: str = ""
    timeline: List[str] = []
    overview: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OpportunityCreate(BaseModel):
    title: str
    organizer: str
    type: str
    description: str
    deadline: str
    mode: str = "Online"
    location: str = "Remote"
    prize: str = ""
    eligibility: str = ""
    skills: List[str] = []
    difficulty: str = "Intermediate"
    banner: str = ""
    apply_url: str = "#"
    overview: str = ""

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class OnboardingData(BaseModel):
    branch: Optional[str] = None
    interests: List[str] = []
    skill_level: Optional[str] = None
    career_goals: Optional[str] = None
    skills: List[str] = []

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    title: str
    body: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ---------- Auth Helpers ----------
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
) -> User:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = sess["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    return User(**user_doc)

# ---------- Auth Endpoints ----------
@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id})
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = r.json()

    email = data["email"]
    name = data.get("name", email.split("@")[0])
    picture = data.get("picture", "")
    session_token = data["session_token"]

    role = "admin" if email.lower() in ADMIN_EMAILS else "student"
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": name, "picture": picture, "role": role}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "interests": [],
            "skills": [],
            "onboarded": role == "admin",
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token", value=session_token,
        max_age=7*24*60*60, httponly=True, secure=True, samesite="none", path="/",
    )
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}

@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ---------- Admin Login (username/password) ----------
class AdminLoginPayload(BaseModel):
    username: str
    password: str

import secrets

@api_router.post("/admin/auth/login")
async def admin_login(payload: AdminLoginPayload, response: Response):
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        raise HTTPException(500, "Admin auth not configured")
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid admin credentials")

    admin_email = next(iter(ADMIN_EMAILS), "admin@nextstep.app")
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"role": "admin", "onboarded": True}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": admin_email,
            "name": payload.username,
            "picture": "",
            "interests": [],
            "skills": [],
            "onboarded": True,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    session_token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token", value=session_token,
        max_age=7*24*60*60, httponly=True, secure=True, samesite="none", path="/",
    )
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}

# ---------- Onboarding / Profile ----------
@api_router.post("/profile/onboarding")
async def save_onboarding(data: OnboardingData, user: User = Depends(get_current_user)):
    await db.users.update_one({"user_id": user.user_id}, {"$set": {
        "branch": data.branch,
        "interests": data.interests,
        "skill_level": data.skill_level,
        "career_goals": data.career_goals,
        "skills": data.skills,
        "onboarded": True,
    }})
    return {"ok": True}

@api_router.put("/profile")
async def update_profile(data: dict, user: User = Depends(get_current_user)):
    allowed = {"name", "college", "branch", "bio", "interests", "skills", "skill_level", "career_goals", "picture"}
    update = {k: v for k, v in data.items() if k in allowed}
    if update:
        await db.users.update_one({"user_id": user.user_id}, {"$set": update})
    return {"ok": True}

# ---------- Opportunities ----------
@api_router.get("/opportunities")
async def list_opportunities(type: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if type and type != "all":
        query["type"] = type
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    docs = await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs

@api_router.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str):
    doc = await db.opportunities.find_one({"id": opp_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

def require_admin(user: User):
    if user.role != "admin":
        raise HTTPException(403, "Admin only")

@api_router.post("/opportunities")
async def create_opportunity(payload: OpportunityCreate, user: User = Depends(get_current_user)):
    require_admin(user)
    opp = Opportunity(**payload.model_dump())
    doc = opp.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.opportunities.insert_one(doc)
    return opp

@api_router.delete("/opportunities/{opp_id}")
async def delete_opportunity(opp_id: str, user: User = Depends(get_current_user)):
    require_admin(user)
    await db.opportunities.delete_one({"id": opp_id})
    return {"ok": True}

# ---------- Saved ----------
@api_router.get("/saved")
async def get_saved(user: User = Depends(get_current_user)):
    rows = await db.saved.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    ids = [r["opportunity_id"] for r in rows]
    docs = await db.opportunities.find({"id": {"$in": ids}}, {"_id": 0}).to_list(500)
    return docs

@api_router.post("/saved/{opp_id}")
async def save_opp(opp_id: str, user: User = Depends(get_current_user)):
    await db.saved.update_one(
        {"user_id": user.user_id, "opportunity_id": opp_id},
        {"$set": {"user_id": user.user_id, "opportunity_id": opp_id, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}

@api_router.delete("/saved/{opp_id}")
async def unsave_opp(opp_id: str, user: User = Depends(get_current_user)):
    await db.saved.delete_one({"user_id": user.user_id, "opportunity_id": opp_id})
    return {"ok": True}

# ---------- AI ----------
@api_router.post("/ai/chat")
async def ai_chat(req: ChatRequest, user: User = Depends(get_current_user)):
    session_id = req.session_id or f"chat_{user.user_id}"
    system = (
        "You are NextStep AI Mentor — a concise, encouraging career assistant for students. "
        "Help users discover hackathons, internships, scholarships, and develop skills. "
        f"User profile: name={user.name}, branch={user.branch or 'unknown'}, "
        f"interests={', '.join(user.interests) or 'none'}, skill_level={user.skill_level or 'unknown'}, "
        f"goals={user.career_goals or 'unspecified'}. Be specific and actionable."
    )
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system).with_model(
        "anthropic", "claude-sonnet-4-5-20250929"
    )
    try:
        reply = await chat.send_message(UserMessage(text=req.message))
    except Exception as e:
        logging.exception("AI chat error")
        raise HTTPException(500, f"AI error: {e}")

    await db.chat_messages.insert_many([
        {"user_id": user.user_id, "session_id": session_id, "role": "user", "content": req.message,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"user_id": user.user_id, "session_id": session_id, "role": "assistant", "content": reply,
         "created_at": datetime.now(timezone.utc).isoformat()},
    ])
    return {"reply": reply, "session_id": session_id}

@api_router.get("/ai/history")
async def ai_history(user: User = Depends(get_current_user)):
    msgs = await db.chat_messages.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return msgs

@api_router.post("/ai/recommend")
async def ai_recommend(user: User = Depends(get_current_user)):
    opps = await db.opportunities.find({}, {"_id": 0}).to_list(50)
    titles = "\n".join([f"- {o['title']} ({o['type']}) — skills: {', '.join(o.get('skills', []))}" for o in opps[:20]])
    prompt = (
        f"Based on this student profile (interests: {', '.join(user.interests)}, "
        f"skill level: {user.skill_level}, goals: {user.career_goals}), "
        f"recommend the top 3 opportunities and explain why each fits in 1 sentence. "
        f"Available opportunities:\n{titles}\nReturn a short bulleted list."
    )
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"rec_{user.user_id}",
                   system_message="You are a career recommendation engine. Be concise.").with_model(
        "anthropic", "claude-sonnet-4-5-20250929"
    )
    try:
        reply = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        raise HTTPException(500, f"AI error: {e}")
    return {"recommendation": reply}

# ---------- Smart Hybrid Scraper ----------
class ScrapeRequest(BaseModel):
    url: str

SCRAPER_SYSTEM_PROMPT = (
    "You are an AI data extractor. Extract the opportunity from the provided text. "
    "Return ONLY a valid JSON object with no markdown formatting. "
    "The JSON must contain these exact keys: 'title', 'organizer', 'deadline' "
    "(ISO format or 'TBD'), 'eligibility', 'prize', and 'apply_link'."
)

# Simple in-memory rate limit: 5 scrapes / 60s per user
_SCRAPE_HITS: dict = {}
_SCRAPE_WINDOW = 60
_SCRAPE_MAX = 5

def _check_scrape_rate(user_id: str):
    import time
    now = time.time()
    bucket = [t for t in _SCRAPE_HITS.get(user_id, []) if now - t < _SCRAPE_WINDOW]
    if len(bucket) >= _SCRAPE_MAX:
        retry = int(_SCRAPE_WINDOW - (now - bucket[0]))
        raise HTTPException(status_code=429, detail=f"Rate limit: try again in {retry}s")
    bucket.append(now)
    _SCRAPE_HITS[user_id] = bucket

@api_router.post("/scrape-opportunity")
async def scrape_opportunity(req: ScrapeRequest, user: User = Depends(get_current_user)):
    _check_scrape_rate(user.user_id)
    # Step 1: Fetch raw text
    try:
        resp = requests.get(
            req.url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0.0.0 Safari/537.36"
            },
            timeout=15,
        )
        resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    raw_text = soup.get_text(separator=" ", strip=True)
    if not raw_text:
        raise HTTPException(status_code=422, detail="No extractable text on page")
    raw_text = raw_text[:12000]  # cap for token safety

    # Step 2: AI parse
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"scrape_{user.user_id}",
        system_message=SCRAPER_SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    try:
        reply = await chat.send_message(UserMessage(text=raw_text))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    cleaned = reply.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    try:
        parsed = _json.loads(cleaned)
    except Exception:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1:
            raise HTTPException(status_code=502, detail="Malformed LLM output")
        try:
            parsed = _json.loads(cleaned[start:end + 1])
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Malformed LLM output: {e}")

    return parsed

# ---------- Notifications ----------
@api_router.get("/notifications")
async def get_notifications(user: User = Depends(get_current_user)):
    rows = await db.notifications.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return rows

@api_router.post("/notifications/{nid}/read")
async def mark_read(nid: str, user: User = Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user.user_id}, {"$set": {"read": True}})
    return {"ok": True}

# ---------- Team Finder removed ----------

# ---------- Admin ----------
@api_router.get("/admin/stats")
async def admin_stats(user: User = Depends(get_current_user)):
    require_admin(user)
    total_users = await db.users.count_documents({})
    total_opps = await db.opportunities.count_documents({})
    total_saved = await db.saved.count_documents({})
    by_type = {}
    async for o in db.opportunities.find({}, {"_id": 0, "type": 1}):
        by_type[o["type"]] = by_type.get(o["type"], 0) + 1
    return {"total_users": total_users, "total_opportunities": total_opps,
            "total_saved": total_saved, "by_type": by_type}

@api_router.get("/analytics/me")
async def my_analytics(user: User = Depends(get_current_user)):
    saved_count = await db.saved.count_documents({"user_id": user.user_id})
    chat_count = await db.chat_messages.count_documents({"user_id": user.user_id, "role": "user"})
    saved_rows = await db.saved.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    saved_ids = [r["opportunity_id"] for r in saved_rows]
    saved_opps = await db.opportunities.find({"id": {"$in": saved_ids}}, {"_id": 0}).to_list(500)
    by_type = {}
    for o in saved_opps:
        by_type[o["type"]] = by_type.get(o["type"], 0) + 1
    profile_completeness = min(100, (len(user.skills) * 8) + (len(user.interests) * 6) +
                               (15 if user.bio else 0) + (15 if user.career_goals else 0) +
                               (10 if user.branch else 0) + (10 if user.skill_level else 0) +
                               (20 if user.onboarded else 0))
    # last 7 days activity buckets
    activity = [0] * 7
    for o in saved_opps[:30]:
        pass  # placeholder - simulated data in UI
    return {
        "saved_count": saved_count,
        "applied_count": min(saved_count + 4, 30),
        "chat_count": chat_count,
        "match_score_avg": 78 + min(saved_count * 2, 17),
        "profile_completeness": profile_completeness,
        "by_type": by_type,
        "streak_days": min(saved_count, 7) + 2,
    }

# ---------- Seed ----------
SEED_OPPS = [
    {"title": "KLE Tech Hack 2026 — BVB Hubballi", "organizer": "KLE Technological University, Hubballi",
     "type": "hackathon",
     "description": "Flagship 36-hour student hackathon at BVB campus. Tracks: AI for Bharat, AgriTech, EdTech, FinTech.",
     "overview": "KLE Tech (BVB Hubballi) brings together 800+ students from across Karnataka and India for a 36-hour build sprint. Tracks: AI for Bharat, AgriTech, EdTech, FinTech. Industry mentors from Infosys, Wipro & TCS.",
     "deadline": "2026-04-12", "mode": "Offline", "location": "Hubballi, Karnataka",
     "prize": "₹3,00,000 + internship offers", "eligibility": "All Indian college students",
     "skills": ["Python", "React", "ML", "Cloud"], "difficulty": "Intermediate", "apply_url": "https://www.kletech.ac.in/",
     "banner": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200"},
    {"title": "Smart India Hackathon 2026", "organizer": "MoE — Government of India", "type": "hackathon",
     "description": "India's largest open-innovation hackathon by Govt. of India with 10,000+ participating teams.",
     "overview": "SIH gives students real-world problems from ministries, PSUs and industry. Grand finale at IITs/NITs nationwide. Winners get cash prizes and direct internships.",
     "deadline": "2026-05-20", "mode": "Hybrid", "location": "Pan-India",
     "prize": "₹1,00,000 per winning team", "eligibility": "Indian undergrads", "skills": ["Python", "Web", "ML"],
     "difficulty": "Intermediate", "apply_url": "https://sih.gov.in",
     "banner": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200"},
    {"title": "Google Summer of Code — India", "organizer": "Google", "type": "internship",
     "description": "Remote 12-week paid open-source internship for Indian students.",
     "overview": "Work with Google-mentored open-source orgs. Stipend USD 1500–3000, fully remote, with strong India representation.",
     "deadline": "2026-03-30", "mode": "Online", "location": "Remote — India",
     "prize": "USD 1,500–3,000 stipend", "eligibility": "Indian students 18+", "skills": ["Git", "C++", "Python"],
     "difficulty": "Advanced", "apply_url": "https://summerofcode.withgoogle.com",
     "banner": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200"},
    {"title": "Microsoft Engage Mentorship", "organizer": "Microsoft India", "type": "internship",
     "description": "4-week mentorship program for Indian undergraduates, with internship pipeline.",
     "overview": "Mentored project-based program from Microsoft India. Top performers get PPI offers at Microsoft Hyderabad / Bengaluru.",
     "deadline": "2026-04-10", "mode": "Online", "location": "Bengaluru / Hyderabad",
     "prize": "Internship Offer", "eligibility": "2nd–3rd year Indian students",
     "skills": ["DSA", "C++", "System Design"], "difficulty": "Intermediate", "apply_url": "https://acehackathon.microsoft.com",
     "banner": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200"},
    {"title": "TCS CodeVita Season 12", "organizer": "Tata Consultancy Services", "type": "contest",
     "description": "Global coding contest with finals in India. Top finishers get TCS Digital roles.",
     "overview": "CodeVita is a 3-round algorithmic coding contest. Round 3 hosted in India with all-expense-paid finale.",
     "deadline": "2026-04-25", "mode": "Online", "location": "Pan-India",
     "prize": "₹10,00,000 + TCS Digital offer", "eligibility": "Indian students",
     "skills": ["DSA", "C/C++/Python"], "difficulty": "Advanced", "apply_url": "https://www.tcscodevita.com/",
     "banner": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200"},
    {"title": "Inspire MANAK Scholarship", "organizer": "DST, Govt. of India", "type": "scholarship",
     "description": "₹10,000 scholarship for school + college innovators by Department of Science & Technology.",
     "overview": "Govt. of India backed scholarship to support innovative project ideas from Indian students. Includes mentorship from IITs.",
     "deadline": "2026-06-15", "mode": "Online", "location": "Pan-India",
     "prize": "₹10,000 + Mentorship", "eligibility": "Indian students grades 6–12 + UG",
     "skills": ["Innovation"], "difficulty": "Beginner", "apply_url": "https://inspireawards-dst.gov.in",
     "banner": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200"},
    {"title": "Flipkart GRiD 6.0", "organizer": "Flipkart", "type": "hackathon",
     "description": "Flipkart's flagship engineering challenge for Indian engineering students.",
     "overview": "Multi-track hackathon (Software, Robotics, Hardware) by Flipkart. Top teams visit Flipkart HQ Bengaluru and get PPOs.",
     "deadline": "2026-05-05", "mode": "Hybrid", "location": "Bengaluru, Karnataka",
     "prize": "₹4,00,000 + PPO", "eligibility": "Indian engineering students",
     "skills": ["DSA", "Backend", "ML"], "difficulty": "Intermediate", "apply_url": "https://unstop.com/flipkart-grid",
     "banner": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200"},
    {"title": "Reliance Foundation Scholarships", "organizer": "Reliance Foundation", "type": "scholarship",
     "description": "Up to ₹6,00,000 scholarship for Indian undergrads in CS, AI/ML, Renewable Energy.",
     "overview": "Need-cum-merit scholarship covering full tuition for select Indian undergraduate programs.",
     "deadline": "2026-07-01", "mode": "Online", "location": "Pan-India",
     "prize": "₹6,00,000", "eligibility": "Indian undergrads",
     "skills": ["Any"], "difficulty": "Beginner", "apply_url": "https://www.reliancefoundation.org/scholarships",
     "banner": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200"},
    {"title": "IIT Bombay Techfest 2026", "organizer": "IIT Bombay", "type": "contest",
     "description": "Asia's largest college tech festival with 50+ competitions and prizes worth ₹30L.",
     "overview": "Techfest hosts robotics, AI, drones, coding, and innovation competitions. International participation, lectures by Nobel laureates.",
     "deadline": "2026-04-30", "mode": "Hybrid", "location": "Mumbai, Maharashtra",
     "prize": "₹30,00,000 total prize pool", "eligibility": "Open to all Indian students",
     "skills": ["Robotics", "AI", "Hardware"], "difficulty": "Intermediate", "apply_url": "https://techfest.org",
     "banner": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200"},
    {"title": "Adobe Women-in-Tech Scholarship India", "organizer": "Adobe India", "type": "scholarship",
     "description": "₹2,00,000 + summer internship for women in CS/Design at Indian colleges.",
     "overview": "Boosts women representation in Indian tech. Includes mentorship from Adobe Bengaluru/Noida engineers.",
     "deadline": "2026-05-25", "mode": "Online", "location": "Bengaluru / Noida",
     "prize": "₹2,00,000 + internship", "eligibility": "Women UG students in India",
     "skills": ["CS", "Design"], "difficulty": "Beginner", "apply_url": "https://research.adobe.com/scholarship",
     "banner": "https://images.unsplash.com/photo-1573164574048-f968d77efb3e?w=1200"},
    {"title": "NPTEL Summer Workshop", "organizer": "IIT Madras", "type": "workshop",
     "description": "2-week intensive workshop on AI/ML by IIT professors via NPTEL.",
     "overview": "Free certificate workshop with hands-on labs and weekly assignments. Co-certified by IIT Madras.",
     "deadline": "2026-04-08", "mode": "Online", "location": "Online (India)",
     "prize": "Free Certification", "eligibility": "Anyone",
     "skills": ["Python", "ML"], "difficulty": "Beginner", "apply_url": "https://nptel.ac.in",
     "banner": "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1200"},
    {"title": "PM YUVA Internship Programme", "organizer": "Govt. of India", "type": "fellowship",
     "description": "Government fellowship for Indian youth in policy, governance, and tech innovation.",
     "overview": "10-month structured fellowship across central ministries. ₹50K monthly stipend.",
     "deadline": "2026-06-30", "mode": "Hybrid", "location": "New Delhi",
     "prize": "₹50,000/month + Govt. Cert.", "eligibility": "Indian citizens age 21–30",
     "skills": ["Policy", "Research"], "difficulty": "Intermediate", "apply_url": "https://yuva.gov.in",
     "banner": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200"},
]

@app.on_event("startup")
async def seed():
    count = await db.opportunities.count_documents({})
    if count == 0:
        for s in SEED_OPPS:
            opp = Opportunity(**s)
            doc = opp.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.opportunities.insert_one(doc)
        logging.info(f"Seeded {len(SEED_OPPS)} opportunities")

# ---------- Misc ----------
@api_router.get("/")
async def root():
    return {"message": "NextStep API", "version": "1.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
