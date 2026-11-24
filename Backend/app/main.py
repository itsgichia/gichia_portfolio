import logging
from contextlib import asynccontextmanager
import os
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from . import bio, icd, rsv
from .auth import admin_enabled, check_password, issue_token, require_admin
from .db import Base, SessionLocal, engine, get_db
from .models import Education, Experience, Message, Profile, Project
from .schemas import (
    BioAlignIn,
    BioSeqIn,
    BioTreeIn,
    BioVariantsIn,
    EducationOut,
    ExperienceIn,
    IcdIn,
    ExperienceOut,
    LoginIn,
    MessageIn,
    MessageOut,
    PgxPanelIn,
    ProfileIn,
    ProfileOut,
    ProjectIn,
    ProjectOut,
    RsvCompareIn,
    RsvIn,
)
from .seed import seed

logging.basicConfig(level=logging.INFO)

def _add_missing_columns() -> None:
    """Add columns that were introduced after a table was first created (no Alembic here)."""
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing = {c["name"] for c in inspector.get_columns(table.name)}
            for col in table.columns:
                if col.name not in existing:
                    ddl = f"ALTER TABLE {table.name} ADD COLUMN {col.name} {col.type.compile(engine.dialect)}"
                    if col.default is not None and isinstance(col.default.arg, (str, int)):
                        ddl += f" DEFAULT {col.default.arg!r}"
                    conn.execute(text(ddl))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _add_missing_columns()
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Gichia Muiruri Portfolio API", version="2.0.0", lifespan=lifespan)

_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
# Vercel preview deployments get a fresh hostname each time; allow them by pattern.
_origin_regex = os.getenv("CORS_ORIGIN_REGEX", r"https://gichia-portfolio(-[a-z0-9-]+)?\.vercel\.app")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=_origin_regex,
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



@app.get("/api/rsv/defaults")
def rsv_defaults():
    return rsv.defaults()


@app.post("/api/rsv/simulate")
def rsv_simulate(body: RsvIn):
    return rsv.run(body)


@app.post("/api/rsv/compare")
def rsv_compare(body: RsvCompareIn):
    return rsv.compare([(s.label, s.params) for s in body.scenarios])


@app.get("/api/icd/status")
def icd_status():
    return icd.status()


@app.get("/api/icd/examples")
def icd_examples():
    return icd.examples()


_icd_log: dict[str, deque] = defaultdict(deque)


@app.post("/api/icd/code")
def icd_code(body: IcdIn, request: Request):
    if not icd.available():
        raise HTTPException(503, "The coding lab is not switched on for this server.")
    if _over_limit(_icd_log, _client_ip(request), 10):
        raise HTTPException(429, "Ten notes an hour per visitor. Try again later.")
    if _over_limit(_icd_log, "everyone", 300, window=86400):
        raise HTTPException(429, "The lab has used its daily budget. Try again tomorrow.")
    try:
        return icd.code_note(body.note)
    except icd.ModelError as e:
        raise HTTPException(502, str(e)) from e


def _bio(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except bio.BioError as e:
        raise HTTPException(422, str(e)) from e


@app.get("/api/bio/examples")
def bio_examples():
    return bio.examples()


@app.post("/api/bio/stats")
def bio_stats(body: BioSeqIn):
    return _bio(bio.stats, body.sequence, body.min_orf_aa)


@app.post("/api/bio/align")
def bio_align(body: BioAlignIn):
    return _bio(bio.align, body.a, body.b, body.mode, body.match, body.mismatch, body.gap)


@app.post("/api/bio/tree")
def bio_tree(body: BioTreeIn):
    return _bio(bio.tree, body.fasta, body.distance)


@app.post("/api/bio/variants")
def bio_variants(body: BioVariantsIn):
    return _bio(bio.call_variants, body.reference, body.sample)


@app.get("/api/bio/pgx/catalogue")
def bio_pgx_catalogue():
    return bio.pgx_catalogue()


@app.post("/api/bio/pgx")
def bio_pgx(body: PgxPanelIn):
    return _bio(bio.pgx_panel, [(g.gene, g.allele_1, g.allele_2) for g in body.genotypes])


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
