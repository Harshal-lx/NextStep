import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nextstep-ai-2.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "BLUELOCKZ"
ADMIN_PASS = "TakiTaki"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/admin/auth/login",
        json={"username": ADMIN_USER, "password": ADMIN_PASS},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed {r.status_code}: {r.text}")
    return r.json()["session_token"]


@pytest.fixture
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


@pytest.fixture(scope="session")
def student_token():
    """Inject a student session directly via admin -> can't, so use mongosh via shell."""
    import subprocess, time
    token = f"test_session_{int(time.time()*1000)}"
    user_id = f"test-user-{int(time.time()*1000)}"
    js = f"""
    db.users.insertOne({{
      user_id: '{user_id}', email: 'test.student@example.com', name: 'Test Student',
      picture: '', interests: ['AI'], skills: ['Python'], skill_level: 'Intermediate',
      career_goals: 'Win SIH', onboarded: true, role: 'student',
      created_at: new Date().toISOString()
    }});
    db.user_sessions.insertOne({{
      user_id: '{user_id}', session_token: '{token}',
      expires_at: new Date(Date.now()+7*24*60*60*1000).toISOString(),
      created_at: new Date().toISOString()
    }});
    """
    try:
        subprocess.run(["mongosh", "test_database", "--quiet", "--eval", js],
                       check=True, capture_output=True, timeout=15)
    except Exception as e:
        pytest.skip(f"Could not seed student session: {e}")
    return token


@pytest.fixture
def student_client(student_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {student_token}",
    })
    return s
