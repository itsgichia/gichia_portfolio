import logging
from contextlib import asynccontextmanager
import os
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, WebSocket, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import live, rsv
from .auth import admin_enabled, check_password, issue_token, require_admin
from .db import Base, SessionLocal, engine, get_db
from .models import Counter, Education, Experience, GuestbookEntry, Message, Profile, Project
from .schemas import (
    EducationOut,
    ExperienceIn,
    ExperienceOut,
    GuestbookIn,
    GuestbookOut,
    LoginIn,
    MessageIn,
    MessageOut,
    ProfileIn,
    ProfileOut,
    ProjectIn,
    ProjectOut,
    RsvCompareIn,
    RsvIn,
)
from .seed import seed

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Gichia Muiruri Portfolio API", version="2.0.0", lifespan=lifespan)

_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/profile", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    profile = db.get(Profile, 1)
    if not profile:
        raise HTTPException(404, "Profile not set up")
    return profile


@app.get("/api/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    q = select(Project).where(Project.published.is_(True)).order_by(Project.order_index)
    return db.scalars(q).all()


@app.get("/api/projects/{slug}", response_model=ProjectOut)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.slug == slug, Project.published.is_(True)))
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@app.get("/api/experience", response_model=list[ExperienceOut])
def list_experience(db: Session = Depends(get_db)):
    return db.scalars(select(Experience).order_by(Experience.order_index)).all()


@app.get("/api/education", response_model=list[EducationOut])
def list_education(db: Session = Depends(get_db)):
    return db.scalars(select(Education).order_by(Education.order_index)).all()


_contact_log: dict[str, deque] = defaultdict(deque)
_guestbook_log: dict[str, deque] = defaultdict(deque)
_visit_log: dict[str, float] = {}


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _over_limit(log: dict[str, deque], key: str, limit: int, window: float = 3600) -> bool:
    """Record a hit for key and report whether it exceeds limit within window seconds."""
    now = time.time()
    hits = log[key]
    while hits and now - hits[0] > window:
        hits.popleft()
    if len(hits) >= limit:
        return True
    hits.append(now)
    return False


@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def contact(msg: MessageIn, request: Request, db: Session = Depends(get_db)):
    if msg.website:  # honeypot field filled in: quietly accept and drop
        return {"ok": True}
    if _over_limit(_contact_log, _client_ip(request), 5):
        raise HTTPException(429, "Too many messages. Please try again later or email me directly.")
    db.add(Message(name=msg.name, email=msg.email, organisation=msg.organisation, body=msg.body))
    db.commit()
    return {"ok": True}


@app.get("/api/guestbook", response_model=list[GuestbookOut])
def list_guestbook(db: Session = Depends(get_db)):
    return db.scalars(select(GuestbookEntry).order_by(GuestbookEntry.created_at.desc()).limit(100)).all()


@app.post("/api/guestbook", response_model=GuestbookOut | None, status_code=status.HTTP_201_CREATED)
def sign_guestbook(body: GuestbookIn, request: Request, db: Session = Depends(get_db)):
    if body.website:  # honeypot
        return None
    if _over_limit(_guestbook_log, _client_ip(request), 3):
        raise HTTPException(429, "You've signed a few times already. Try again in an hour.")
    entry = GuestbookEntry(name=body.name, message=body.message, site=body.site or None)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.post("/api/visits")
def count_visit(request: Request, db: Session = Depends(get_db)):
    """Increment the hit counter, at most once per visitor IP every 30 minutes."""
    counter = db.get(Counter, "visits") or Counter(key="visits", value=0)
    ip, now = _client_ip(request), time.time()
    if len(_visit_log) > 10_000:
        _visit_log.clear()
    if now - _visit_log.get(ip, 0) > 1800:
        _visit_log[ip] = now
        counter.value += 1
        db.add(counter)
        db.commit()
    return {"count": counter.value}


@app.websocket("/api/live")
async def live_socket(ws: WebSocket):
    await live.endpoint(ws, _origins)


@app.get("/api/rsv/defaults")
def rsv_defaults():
    return rsv.defaults()


@app.post("/api/rsv/simulate")
def rsv_simulate(body: RsvIn):
    return rsv.run(body)


@app.post("/api/rsv/compare")
def rsv_compare(body: RsvCompareIn):
    return rsv.compare([(s.label, s.params) for s in body.scenarios])


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
@app.post("/api/auth/login")
def login(body: LoginIn):
    if not admin_enabled():
        raise HTTPException(503, "Admin is not configured. Set ADMIN_PASSWORD on the server.")
    if not check_password(body.password):
        time.sleep(0.5)
        raise HTTPException(401, "Incorrect password")
    return {"token": issue_token()}


admin = Depends(require_admin)


@app.get("/api/admin/projects", response_model=list[ProjectOut], dependencies=[admin])
def admin_projects(db: Session = Depends(get_db)):
    return db.scalars(select(Project).order_by(Project.order_index)).all()


@app.post("/api/admin/projects", response_model=ProjectOut, status_code=201, dependencies=[admin])
def create_project(body: ProjectIn, db: Session = Depends(get_db)):
    if db.scalar(select(Project).where(Project.slug == body.slug)):
        raise HTTPException(409, "A project with this slug already exists")
    project = Project(**body.model_dump(mode="json"))
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.put("/api/admin/projects/{pid}", response_model=ProjectOut, dependencies=[admin])
def update_project(pid: int, body: ProjectIn, db: Session = Depends(get_db)):
    project = db.get(Project, pid)
    if not project:
        raise HTTPException(404, "Project not found")
    clash = db.scalar(select(Project).where(Project.slug == body.slug, Project.id != pid))
    if clash:
        raise HTTPException(409, "A project with this slug already exists")
    for k, v in body.model_dump(mode="json").items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


@app.delete("/api/admin/projects/{pid}", status_code=204, dependencies=[admin])
def delete_project(pid: int, db: Session = Depends(get_db)):
    project = db.get(Project, pid)
    if not project:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()


@app.put("/api/admin/profile", response_model=ProfileOut, dependencies=[admin])
def update_profile(body: ProfileIn, db: Session = Depends(get_db)):
    profile = db.get(Profile, 1) or Profile(id=1)
    for k, v in body.model_dump(mode="json").items():
        setattr(profile, k, v)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@app.put("/api/admin/experience/{eid}", response_model=ExperienceOut, dependencies=[admin])
def update_experience(eid: int, body: ExperienceIn, db: Session = Depends(get_db)):
    item = db.get(Experience, eid)
    if not item:
        raise HTTPException(404, "Experience entry not found")
    for k, v in body.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/admin/guestbook/{gid}", status_code=204, dependencies=[admin])
def delete_guestbook_entry(gid: int, db: Session = Depends(get_db)):
    entry = db.get(GuestbookEntry, gid)
    if not entry:
        raise HTTPException(404, "Guestbook entry not found")
    db.delete(entry)
    db.commit()


@app.delete("/api/admin/chat", status_code=204, dependencies=[admin])
def clear_chat():
    live.hub.clear_chat()


@app.get("/api/admin/messages", response_model=list[MessageOut], dependencies=[admin])
def list_messages(db: Session = Depends(get_db)):
    return db.scalars(select(Message).order_by(Message.created_at.desc())).all()


@app.patch("/api/admin/messages/{mid}/read", response_model=MessageOut, dependencies=[admin])
def mark_read(mid: int, db: Session = Depends(get_db)):
    msg = db.get(Message, mid)
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.read = True
    db.commit()
    db.refresh(msg)
    return msg


# ---------------------------------------------------------------------------
# Serve the built React app (single Railway service). API routes take priority.
# ---------------------------------------------------------------------------
STATIC_DIR = Path(os.getenv("STATIC_DIR", Path(__file__).resolve().parents[1] / "static"))
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(404, "Not found")
        candidate = (STATIC_DIR / full_path).resolve()
        if full_path and candidate.is_file() and STATIC_DIR.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
