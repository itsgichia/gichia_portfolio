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


def test_guestbook_sign_list_and_moderate():
    with client() as c:
        assert c.post("/api/guestbook", json={"name": " ", "message": "hi there"}).status_code == 422
        assert c.post("/api/guestbook", json={"name": "Sam", "message": "hi", "site": "javascript:alert(1)"}).status_code == 422
        r = c.post("/api/guestbook", json={"name": "Sam", "message": "Lovely site!", "site": "https://sam.example"})
        assert r.status_code == 201
        gid = r.json()["id"]
        assert c.get("/api/guestbook").json()[0]["message"] == "Lovely site!"
        assert c.delete(f"/api/admin/guestbook/{gid}").status_code == 401
        token = c.post("/api/auth/login", json={"password": "test-password"}).json()["token"]
        assert c.delete(f"/api/admin/guestbook/{gid}", headers={"Authorization": f"Bearer {token}"}).status_code == 204
        assert all(e["id"] != gid for e in c.get("/api/guestbook").json())


def test_visit_counter_counts_once_per_visitor():
    with client() as c:
        first = c.post("/api/visits").json()["count"]
        assert first >= 1
        assert c.post("/api/visits").json()["count"] == first


def test_live_socket_chat_and_cursors():
    with client() as c:
        with c.websocket_connect("/api/live") as a, c.websocket_connect("/api/live") as b:
            assert a.receive_json()["t"] == "hello"
            assert a.receive_json() == {"t": "online", "n": 1}
            assert a.receive_json() == {"t": "online", "n": 2}
            assert b.receive_json()["t"] == "hello"
            assert b.receive_json() == {"t": "online", "n": 2}

            a.send_json({"t": "cursor", "x": 10, "y": 20, "path": "/"})
            moved = b.receive_json()
            assert moved["t"] == "cursor" and (moved["x"], moved["y"]) == (10, 20)

            a.send_json({"t": "chat", "name": "Ann", "text": "  hello   world  "})
            for ws in (a, b):
                said = ws.receive_json()
                assert said["t"] == "chat" and said["text"] == "hello world" and said["name"] == "Ann"

        with c.websocket_connect("/api/live") as d:
            assert any(m["text"] == "hello world" for m in d.receive_json()["history"])


def test_live_socket_rejects_foreign_origin():
    import pytest
    from starlette.websockets import WebSocketDisconnect

    with client() as c, pytest.raises(WebSocketDisconnect):
        with c.websocket_connect("/api/live", headers={"origin": "https://evil.example"}) as ws:
            ws.receive_json()
