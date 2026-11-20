import os
import tempfile

os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["ADMIN_PASSWORD"] = "test-password"
os.environ["SECRET_KEY"] = "test-secret"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def client():
    return TestClient(app)


def test_public_content_is_seeded():
    with client() as c:
        assert c.get("/api/health").json() == {"status": "ok"}
        assert c.get("/api/profile").json()["name"] == "Gichia Muiruri"
        slugs = [p["slug"] for p in c.get("/api/projects").json()]
        assert "rsv-transmission-lab" in slugs and "rhip-connect" in slugs
        assert len(c.get("/api/experience").json()) == 5


def test_admin_requires_login():
    with client() as c:
        assert c.get("/api/admin/projects").status_code == 401
        assert c.post("/api/auth/login", json={"password": "wrong"}).status_code == 401
        token = c.post("/api/auth/login", json={"password": "test-password"}).json()["token"]
        h = {"Authorization": f"Bearer {token}"}
        assert len(c.get("/api/admin/projects", headers=h).json()) == 5
        assert c.get("/api/admin/projects", headers={"Authorization": "Bearer forged.token"}).status_code == 401


def test_publish_and_edit_project():
    with client() as c:
        token = c.post("/api/auth/login", json={"password": "test-password"}).json()["token"]
        h = {"Authorization": f"Bearer {token}"}
        rhip = next(p for p in c.get("/api/admin/projects", headers=h).json() if p["slug"] == "rhip-connect")
        rhip["live_url"] = "https://example.org"
        rhip.pop("updated_at")
        pid = rhip.pop("id")
        r = c.put(f"/api/admin/projects/{pid}", json=rhip, headers=h)
        assert r.status_code == 200 and r.json()["live_url"] == "https://example.org"


def test_contact_and_inbox():
    with client() as c:
        assert c.post("/api/contact", json={"name": "A", "email": "not-an-email", "body": "hello there"}).status_code == 422
        assert c.post("/api/contact", json={"name": "Alex", "email": "alex@example.org", "body": "Hello Gichia"}).status_code == 201
        token = c.post("/api/auth/login", json={"password": "test-password"}).json()["token"]
        msgs = c.get("/api/admin/messages", headers={"Authorization": f"Bearer {token}"}).json()
        assert msgs[0]["email"] == "alex@example.org"


def test_rsv_simulation():
    with client() as c:
        r = c.post("/api/rsv/simulate", json={"maternal_coverage": 0.6, "nirsevimab_coverage": 0.0, "years": 2})
        assert r.status_code == 200
        data = r.json()
        assert len(data["weeks"]) == len(data["under6_baseline"]) == len(data["under6_scenario"])
        first = data["summary"][0]
        assert first["group"] == "0-2 months" and first["percent_averted"] > 30
        assert c.post("/api/rsv/simulate", json={"r0": 9}).status_code == 422
