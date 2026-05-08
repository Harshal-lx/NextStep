"""NextStep backend regression suite — admin auth, opportunities, analytics, saved, profile, AI."""
import pytest
import requests

# ---------- Health ----------
class TestHealth:
    def test_root(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        assert r.json().get("message") == "NextStep API"


# ---------- Opportunities (public) ----------
class TestOpportunities:
    def test_list_returns_12_india_opps(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/opportunities")
        assert r.status_code == 200
        opps = r.json()
        assert isinstance(opps, list)
        assert len(opps) >= 12, f"Expected >=12, got {len(opps)}"

    def test_kle_tech_present(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/opportunities")
        titles = [o["title"] for o in r.json()]
        assert any("KLE Tech" in t for t in titles), f"KLE Tech missing. Got: {titles}"

    def test_locations_india_focused(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/opportunities")
        india_keywords = ["India", "Hubballi", "Bengaluru", "Mumbai", "Hyderabad",
                          "Delhi", "Noida", "Karnataka", "Maharashtra", "Pan-India", "Online"]
        for o in r.json():
            loc = o.get("location", "")
            assert any(k.lower() in loc.lower() for k in india_keywords), \
                f"Non-India location: {o['title']} -> {loc}"

    def test_get_single_opp(self, base_url, api_client):
        opps = api_client.get(f"{base_url}/api/opportunities").json()
        opp_id = opps[0]["id"]
        r = api_client.get(f"{base_url}/api/opportunities/{opp_id}")
        assert r.status_code == 200
        assert r.json()["id"] == opp_id

    def test_filter_hackathon(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/opportunities", params={"type": "hackathon"})
        assert r.status_code == 200
        for o in r.json():
            assert o["type"] == "hackathon"


# ---------- Admin auth ----------
class TestAdminAuth:
    def test_admin_login_success(self, base_url, api_client):
        r = api_client.post(f"{base_url}/api/admin/auth/login",
                            json={"username": "BLUELOCKZ", "password": "TakiTaki"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session_token" in data and len(data["session_token"]) > 10
        assert data["user"]["role"] == "admin"
        # Cookie set
        assert "session_token" in r.cookies

    def test_admin_login_wrong_password(self, base_url, api_client):
        r = api_client.post(f"{base_url}/api/admin/auth/login",
                            json={"username": "BLUELOCKZ", "password": "wrong"})
        assert r.status_code == 401

    def test_admin_login_wrong_username(self, base_url, api_client):
        r = api_client.post(f"{base_url}/api/admin/auth/login",
                            json={"username": "nope", "password": "TakiTaki"})
        assert r.status_code == 401


# ---------- Auth-gated ----------
class TestAuthMe:
    def test_auth_me_unauth(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_auth_me_admin(self, base_url, admin_client):
        r = admin_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_auth_me_student(self, base_url, student_client):
        r = student_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "student"


# ---------- Admin-only endpoints role enforcement ----------
class TestAdminGuard:
    def test_admin_stats_admin(self, base_url, admin_client):
        r = admin_client.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 200
        for k in ["total_users", "total_opportunities", "total_saved", "by_type"]:
            assert k in r.json()

    def test_admin_stats_student_403(self, base_url, student_client):
        r = student_client.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 403

    def test_admin_stats_unauth(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 401

    def test_create_opp_student_403(self, base_url, student_client):
        payload = {"title": "TEST_x", "organizer": "x", "type": "hackathon",
                   "description": "x", "deadline": "2026-12-31"}
        r = student_client.post(f"{base_url}/api/opportunities", json=payload)
        assert r.status_code == 403

    def test_create_and_delete_opp_admin(self, base_url, admin_client):
        payload = {"title": "TEST_admin_opp", "organizer": "TEST", "type": "hackathon",
                   "description": "test", "deadline": "2026-12-31",
                   "location": "Bengaluru, Karnataka"}
        r = admin_client.post(f"{base_url}/api/opportunities", json=payload)
        assert r.status_code == 200
        opp_id = r.json()["id"]
        # GET to verify
        g = admin_client.get(f"{base_url}/api/opportunities/{opp_id}")
        assert g.status_code == 200
        assert g.json()["title"] == "TEST_admin_opp"
        # DELETE
        d = admin_client.delete(f"{base_url}/api/opportunities/{opp_id}")
        assert d.status_code == 200
        # verify removed
        g2 = admin_client.get(f"{base_url}/api/opportunities/{opp_id}")
        assert g2.status_code == 404

    def test_delete_opp_student_403(self, base_url, student_client):
        r = student_client.delete(f"{base_url}/api/opportunities/some-id")
        assert r.status_code == 403


# ---------- Analytics ----------
class TestAnalytics:
    def test_analytics_unauth(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/analytics/me")
        assert r.status_code == 401

    def test_analytics_student(self, base_url, student_client):
        r = student_client.get(f"{base_url}/api/analytics/me")
        assert r.status_code == 200
        d = r.json()
        for k in ["saved_count", "applied_count", "profile_completeness", "by_type", "streak_days"]:
            assert k in d, f"missing {k}"
        assert isinstance(d["profile_completeness"], int)
        assert isinstance(d["by_type"], dict)


# ---------- Saved CRUD ----------
class TestSaved:
    def test_saved_unauth(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/saved")
        assert r.status_code == 401

    def test_saved_crud(self, base_url, student_client):
        # list opps -> pick one
        opps = requests.get(f"{base_url}/api/opportunities").json()
        opp_id = opps[0]["id"]
        # save
        r = student_client.post(f"{base_url}/api/saved/{opp_id}")
        assert r.status_code == 200
        # list saved -> contains
        r2 = student_client.get(f"{base_url}/api/saved")
        assert r2.status_code == 200
        ids = [o["id"] for o in r2.json()]
        assert opp_id in ids
        # unsave
        r3 = student_client.delete(f"{base_url}/api/saved/{opp_id}")
        assert r3.status_code == 200
        # verify removed
        r4 = student_client.get(f"{base_url}/api/saved")
        ids2 = [o["id"] for o in r4.json()]
        assert opp_id not in ids2


# ---------- Profile update ----------
class TestProfile:
    def test_profile_update(self, base_url, student_client):
        r = student_client.put(f"{base_url}/api/profile",
                               json={"bio": "Hello from test", "skills": ["Python", "FastAPI"]})
        assert r.status_code == 200
        me = student_client.get(f"{base_url}/api/auth/me").json()
        assert me["bio"] == "Hello from test"
        assert "FastAPI" in me["skills"]


# ---------- Notifications ----------
class TestNotifications:
    def test_notifications_unauth(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/notifications")
        assert r.status_code == 401

    def test_notifications_list(self, base_url, student_client):
        r = student_client.get(f"{base_url}/api/notifications")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Team finder removed ----------
class TestTeamRemoved:
    def test_team_users_404(self, base_url, api_client):
        r = api_client.get(f"{base_url}/api/team/users")
        assert r.status_code == 404


# ---------- AI Chat (Claude Sonnet 4.5) ----------
class TestAI:
    def test_ai_chat_unauth(self, base_url, api_client):
        r = api_client.post(f"{base_url}/api/ai/chat", json={"message": "hi"})
        assert r.status_code == 401

    def test_ai_chat_student(self, base_url, student_client):
        r = student_client.post(f"{base_url}/api/ai/chat",
                                json={"message": "Suggest one hackathon in 1 short sentence."},
                                timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "reply" in d and isinstance(d["reply"], str) and len(d["reply"]) > 0
