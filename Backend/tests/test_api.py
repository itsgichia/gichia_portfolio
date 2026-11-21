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
        assert len(c.get("/api/admin/projects", headers=h).json()) == 6
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
        body = r.json()
        assert len(body["weeks"]) == len(body["under6_baseline"]) == len(body["under6_scenario"])
        assert body["summary"][0]["group"] == "0-2 months" and body["summary"][0]["percent_averted"] > 30
        assert c.post("/api/rsv/simulate", json={"r0": 9}).status_code == 422
        assert set(body["groups"]) == {"0-2 months", "3-5 months", "6-11 months", "12-23 months"}
        assert len(body["groups"]["0-2 months"]["scenario"]) == len(body["weeks"]) == len(body["prevalence_all_ages"])
        assert body["doses"]["nirsevimab"] == 0 and body["doses"]["maternal"] > 0
        assert body["doses"]["per_admission_averted"] > 0
        assert body["peak_under6"]["scenario"] < body["peak_under6"]["baseline"]
        assert body["mixing"] == "homogeneous"


def test_rsv_mixing_modes_and_validation():
    with client() as c:
        assert c.post("/api/rsv/simulate", json={"mixing": "random"}).status_code == 422
        hom = c.post("/api/rsv/simulate", json={"years": 1}).json()
        ass = c.post("/api/rsv/simulate", json={"years": 1, "mixing": "assortative"}).json()
        assert ass["mixing"] == "assortative"
        # Both are calibrated to the same R0, so the programme's effect is similar in size.
        pct = lambda b: next(row for row in b["summary"] if row["group"] == "Under 2 years")["percent_averted"]
        assert abs(pct(hom) - pct(ass)) < 10


def test_rsv_compare():
    with client() as c:
        body = {
            "scenarios": [
                {"label": "None", "params": {"maternal_coverage": 0, "nirsevimab_coverage": 0, "years": 1}},
                {"label": "Nirsevimab", "params": {"maternal_coverage": 0, "nirsevimab_coverage": 0.6, "years": 1}},
            ]
        }
        rows = c.post("/api/rsv/compare", json=body).json()
        assert [r["label"] for r in rows] == ["None", "Nirsevimab"]
        assert rows[0]["percent_averted"] == 0 and rows[0]["doses_per_admission_averted"] is None
        assert rows[1]["percent_averted"] > 10 and rows[1]["doses_per_year"] > 0
        assert c.post("/api/rsv/compare", json={"scenarios": []}).status_code == 422



def test_rsv_handles_concurrent_requests():
    """LSODA is not thread-safe; the solver is serialised so parallel requests still succeed."""
    from concurrent.futures import ThreadPoolExecutor

    with client() as c:
        def run(cov):
            return c.post("/api/rsv/simulate", json={"nirsevimab_coverage": cov, "years": 1}).status_code

        with ThreadPoolExecutor(4) as pool:
            assert set(pool.map(run, [0.2, 0.4, 0.6, 0.8])) == {200}


def test_sequence_lab():
    from app import bio

    with client() as c:
        ex = c.get("/api/bio/examples").json()
        st = c.post("/api/bio/stats", json={"sequence": ex["sequence"]}).json()
        assert st["kind"] == "dna" and st["length"] == 300 and st["orfs"][0]["protein"].startswith("M")
        assert c.post("/api/bio/stats", json={"sequence": "ACGT123!!"}).status_code == 422

        al = c.post("/api/bio/align", json={"a": "GATTACA", "b": "GCATGCU", "mode": "global", "match": 1, "mismatch": -1, "gap": -1}).json()
        assert al["score"] == 0 and len(al["a"]) == len(al["b"])  # the textbook Needleman-Wunsch example
        loc = bio.align("ACGTACGTTT", "TTACGTAC", "local")
        assert loc["a"] == "ACGTAC" and loc["b"] == "ACGTAC" and loc["score"] == 12
        assert c.post("/api/bio/align", json={"a": "ACGT", "b": "MKV"}).status_code == 422

        tr = c.post("/api/bio/tree", json={"fasta": ex["fasta"]}).json()
        assert tr["n"] == 7 and tr["newick"].endswith(";") and len(tr["nodes"]) == 13
        names = tr["names"]
        # the two synthetic clades are closer within than between
        import itertools
        idx = {nm: i for i, nm in enumerate(names)}
        within = [tr["matrix"][idx[x]][idx[y]] for g in ("A", "B") for x, y in itertools.combinations([n for n in names if n.startswith(g)], 2)]
        between = [tr["matrix"][idx[x]][idx[y]] for x in names if x.startswith("A") for y in names if y.startswith("B")]
        assert max(within) < min(between)
        assert c.post("/api/bio/tree", json={"fasta": ">x\nACGT\n>y\nACGA"}).status_code == 422
