# Darukaa.Earth

A geospatial analytics dashboard for tracking carbon sequestration and biodiversity conservation projects. Built with React, FastAPI, and PostGIS.

**Live demo:** [earth-fawn-three.vercel.app](https://earth-fawn-three.vercel.app)

---

## Architecture Overview

The app is split into two independently deployed pieces:

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│        Frontend (Vercel)        │        │      Backend (Render.com)       │
│                                 │        │                                 │
│  React 18 + Vite                │  HTTP  │  FastAPI + Uvicorn              │
│  MapLibre GL JS (map rendering) │ ─────► │  SQLAlchemy + GeoAlchemy2       │
│  Chart.js (data viz)            │  JSON  │  JWT auth (bcrypt + jose)       │
│  Zustand (auth state)           │        │  PostGIS polygon storage        │
│  React Query (server state)     │        │                                 │
└─────────────────────────────────┘        └───────────────┬─────────────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │   PostgreSQL    │
                                                  │   + PostGIS     │
                                                  └─────────────────┘
```

The frontend is a single-page app — all routes are handled client-side via React Router, with a `PrivateRoute` guard that redirects unauthenticated users to `/login`. API calls go through a single Axios instance (`src/services/api.ts`) that auto-attaches the JWT token from localStorage and handles 401 redirects.

The backend exposes a REST API under the `/api` prefix. Every endpoint (except register/login) requires a valid JWT. The database uses PostGIS to store site boundaries as real `POLYGON` geometries, which means we can do proper spatial queries down the road.

### Why these technologies?

I went with **MapLibre GL JS** instead of Mapbox because Mapbox v2+ requires a paid API token just to load the map — even in development. MapLibre is the open-source fork with the exact same rendering engine and style spec, so the code is essentially identical. If we ever need Mapbox-specific features, it's a one-line import swap plus adding a token.

For charts, I picked **Chart.js** over Highcharts. Both are allowed by the spec, but Chart.js is MIT-licensed and has solid React bindings through `react-chartjs-2`. It handles the line charts, bar charts, and radar charts we need without any licensing concerns.

State management is split: **Zustand** handles auth state (token + user in localStorage) and **React Query** handles all server data (projects, sites, analytics). This keeps things simple — no Redux boilerplate, and React Query gives us caching, background refetch, and loading states out of the box.

The polygon draw tool on the map is custom-built (~40 lines of event handlers on MapLibre) rather than using `@mapbox/mapbox-gl-draw`. That library is 200KB+ and has a complex mode system. Ours is just click-to-add-points with a "Finish & Save" button that appears after 3 points.

For the analytics endpoint, I derive 12-month trends from the stored base scores rather than setting up a time-series database. In production you'd swap this out for real historical data, but for the demo it generates realistic-looking charts without extra infrastructure.

---

## Database Schema

Three tables, all managed by SQLAlchemy with auto-migration on startup:

### users

| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK) | auto-increment |
| name | VARCHAR | full name |
| email | VARCHAR (unique) | login email |
| role | VARCHAR | defaults to "Member" |
| hashed_password | VARCHAR | bcrypt hash |

### projects

| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK) | auto-increment |
| name | VARCHAR | project name |
| type | VARCHAR | Carbon / Biodiversity / Mixed |
| status | VARCHAR | Active / Draft / Inactive |
| description | TEXT | free-text description |
| country | VARCHAR | country name |
| carbon | FLOAT | target carbon in tCO2 |
| verified | BOOLEAN | verification flag |
| owner_id | INT (FK → users.id) | who created it |
| start_date | TIMESTAMP | when the project started |
| last_updated | TIMESTAMP | auto-updated |

### sites

| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK) | auto-increment |
| name | VARCHAR | site name |
| project_id | INT (FK → projects.id) | parent project |
| area | FLOAT | area in hectares |
| polygon | Geography(POLYGON, 4326) | PostGIS geometry |
| type | VARCHAR | Carbon / Biodiversity / Mixed |
| status | VARCHAR | Active / Monitoring / Pending |
| region | VARCHAR | geographic region |
| country | VARCHAR | country name |
| carbon_score | FLOAT | carbon sequestration metric |
| biodiversity_score | FLOAT | biodiversity index (0-100) |
| ndvi | FLOAT | vegetation index (0-1) |
| added_date | TIMESTAMP | when added |
| last_updated | TIMESTAMP | auto-updated |

The `polygon` column uses PostGIS's `Geography` type with SRID 4326 (WGS 84). GeoJSON polygons from the frontend are stored via `ST_GeomFromGeoJSON()` and retrieved via `ST_AsGeoJSON()`.

---

## Running Locally

### What you need

- Node.js 18+
- Python 3.11+
- PostgreSQL with PostGIS (via Docker or Homebrew)

### 1. Start the database

**With Docker:**
```bash
cd backend
docker compose up -d
```

**With Homebrew (macOS):**
```bash
brew services start postgresql
createdb earth_keeper
psql -d earth_keeper -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@localhost:5432/earth_keeper"
export JWT_SECRET="any-secret-string-for-local-dev"

# Start the server (auto-creates tables on first run)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Set up the frontend

```bash
npm install
npm run dev
```

The frontend starts at [http://localhost:8080](http://localhost:8080). It auto-detects that it's running locally and points API calls to `localhost:8000`.

No map API token needed — MapLibre uses free OpenFreeMap tiles.

### 4. Seed sample data (optional)

```bash
python backend/seed_data.py
```

This creates 5 projects and 14 sites with real polygon coordinates across Brazil, India, Indonesia, Niger, and DR Congo.

### 5. First use

1. Go to `/register` and create an account
2. Log in → lands on the dashboard with overview stats and charts
3. Go to Projects → click a project → see its sites and analytics
4. Go to Map View → click the pencil icon → draw a polygon → click "Finish & Save"
5. Click any site on the map → view detailed analytics (carbon trends, NDVI, rainfall)

---

## API Endpoints

Base URL: `http://localhost:8000/api` (local) or `https://darukaa-earth-api.onrender.com/api` (production)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | OAuth2 form login, returns JWT |
| GET | `/projects/` | Yes | List all projects |
| POST | `/projects/` | Yes | Create a project |
| DELETE | `/projects/{id}` | Yes | Delete a project |
| GET | `/sites/` | Yes | List all sites (with GeoJSON polygons) |
| POST | `/sites/` | Yes | Create a site with polygon_geojson |
| GET | `/sites/{id}/analytics` | Yes | 12-month computed analytics |

All authenticated endpoints expect `Authorization: Bearer <token>` in the request header.

---

## CI/CD Pipeline

Defined in `.github/workflows/deploy.yml`. Triggers on every push to `main`.

### What runs

```
push to main
  │
  ├── frontend-lint-and-build
  │     1. checkout repo
  │     2. setup Node 18, npm ci
  │     3. npm run lint     → ESLint + Prettier
  │     4. npm test         → Vitest (13 unit tests)
  │     5. npm run build    → Vite production bundle
  │
  ├── backend-quality
  │     1. checkout repo
  │     2. setup Python 3.11
  │     3. pip install requirements
  │     4. ruff check       → Python linting
  │
  ├── deploy-frontend (needs both jobs above to pass)
  │     → Vercel deploy via amondnet/vercel-action
  │
  └── deploy-backend
        → Trigger Render deploy hook
```

### Secrets you need in GitHub

| Secret | What it's for |
|--------|---------------|
| VERCEL_TOKEN | Vercel API auth |
| VERCEL_ORG_ID | Your Vercel org |
| VERCEL_PROJECT_ID | The Vercel project |
| RENDER_DEPLOY_HOOK_URL | Render deploy webhook URL |

### Pre-commit hooks

Husky runs `lint-staged` on every commit, which:
- Runs ESLint with `--fix` on .ts/.tsx/.js/.jsx files
- Runs Prettier with `--write` on all staged files

So code style is enforced before it even hits the remote.

---

## Project Structure

```
├── .github/workflows/deploy.yml   # CI/CD pipeline
├── .husky/pre-commit              # pre-commit hook
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, startup migrations, CORS
│   │   ├── models.py              # SQLAlchemy models (User, Project, Site)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── database.py            # DB engine + session factory
│   │   ├── auth.py                # JWT creation + verification
│   │   └── routers/
│   │       ├── auth.py            # /auth/register, /auth/login
│   │       ├── projects.py        # project CRUD
│   │       └── sites.py           # site CRUD + analytics endpoint
│   ├── seed_data.py               # database seeder script
│   ├── docker-compose.yml         # PostGIS container
│   ├── requirements.txt           # Python deps
│   └── ruff.toml                  # Python linter config
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx          # overview stats + carbon trend chart
│   │   ├── MapPage.tsx            # MapLibre map + polygon draw tool
│   │   ├── Projects.tsx           # project list (grid/list, filters)
│   │   ├── ProjectDetail.tsx      # project detail + sites table + charts
│   │   ├── Sites.tsx              # all sites list
│   │   ├── SiteDetail.tsx         # site analytics (4 charts)
│   │   ├── Analytics.tsx          # portfolio-level analytics
│   │   ├── Login.tsx / Register.tsx
│   │   └── Settings.tsx           # user settings
│   ├── components/
│   │   ├── layout/                # sidebar, topbar, mobile nav
│   │   └── ui/                    # shadcn/ui components + StatCard, StatusBadge
│   ├── store/authStore.ts         # Zustand auth state
│   ├── hooks/useApi.ts            # React Query hooks (useProjects, useSites, etc)
│   ├── services/api.ts            # Axios instance with auto-auth
│   └── data/                      # TypeScript types + mock data for tests
├── vercel.json                    # Vercel SPA rewrite rules
├── render.yaml                    # Render deployment blueprint
└── package.json
```

---

## Deployment

### Frontend → Vercel

Import the GitHub repo on [vercel.com](https://vercel.com). Vercel auto-detects Vite and builds with `npm run build`. The `vercel.json` handles SPA routing (all paths → `index.html`).

The frontend auto-detects production vs development and uses the correct API URL — no env var needed unless you want to override it.

### Backend → Render

On [render.com](https://render.com), create a new Web Service pointing to the `backend/` directory. Or use "New → Blueprint" which reads `render.yaml` and sets up both the web service and PostgreSQL database automatically.

Required env vars on Render:
- `DATABASE_URL` — the PostgreSQL connection string (use the External URL)
- `JWT_SECRET` — any random string
- `CORS_ALLOW_ORIGINS` — your Vercel domain (e.g. `https://earth-fawn-three.vercel.app`)
