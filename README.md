# Gichia Muiruri: portfolio

My portfolio site, built like RHIP Connect: a React front end, a FastAPI backend and PostgreSQL, deployed on Railway.

- **Public site:** project cards with live links, skills and contact details, in a retro "lab" style with rain and cursor sparkles.
- **RSV Lab** (`/lab/rsv`): an age-structured RSV transmission model that runs live in Python. The model has its own repository, `rsv-transmission-model`.
- **Admin** (`/admin`): sign in to add or edit projects, publish or hide drafts, update the profile (including the phone number shown under Contact) and read contact messages.

```
Dashboard/
├── Backend/            FastAPI app (app/), RSV model (rsvmodel/), tests/
├── Frontend/           React + Vite
├── Dockerfile          builds the front end and serves everything from FastAPI
└── railway.json
```

## Run it locally

Backend, in one terminal:

```bash
cd Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # then set ADMIN_PASSWORD and SECRET_KEY
uvicorn app.main:app --reload --env-file .env
```

Front end, in a second terminal:

```bash
cd Frontend
npm install
npm run dev                 # http://localhost:5173 (API calls are proxied to port 8000)
```

The front end has no content of its own: if the backend is not running on port 8000, the projects panel shows an error and the "systems status" widget reports `lab.api FAIL`. Start the backend first.

The first start creates `portfolio.db` (SQLite) and loads the site content from `Backend/app/seed.py`. To reload that content from scratch, run `python -m app.seed --reset`.

Tests: `cd Backend && pytest -q`

## Deploy: Vercel (site) and Railway (API)

**Railway (backend)**
1. Create a project from this repo. It uses the `Dockerfile` and `railway.json`.
2. Add a **PostgreSQL** database; Railway provides `DATABASE_URL`.
3. Set `ADMIN_PASSWORD`, `SECRET_KEY` (`python -c "import secrets; print(secrets.token_hex(32))"`) and `CORS_ORIGINS` (your Vercel address, e.g. `https://gichia-portfolio.vercel.app`). Vercel preview URLs (`gichia-portfolio-*.vercel.app`) are allowed automatically; override the pattern with `CORS_ORIGIN_REGEX` if the project is renamed.
4. Deploy and generate a domain. Health check: `/api/health`.

**Vercel (front end)**
1. Import the repo and set the root directory to `Frontend` (framework: Vite).
2. Set `VITE_API_URL` to the Railway address (no trailing slash).
3. Deploy. `Frontend/vercel.json` handles page refreshes on inner routes.

The Railway service also serves the built site by itself, so it works as a single deployment if you ever want to skip Vercel.

## Screenshots on project cards

Put images in `Frontend/public/shots/` and set the project's Screenshot field in the admin area, e.g. `/shots/rhip-connect.png`. Cards without one show a plain title panel.

## Editing content

Use the admin area for day-to-day changes. Drafts (Published unticked) are hidden from visitors. Site content is first loaded from `Backend/app/seed.py`.
