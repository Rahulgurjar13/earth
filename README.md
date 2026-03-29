# Darukaa.Earth — Geospatial Carbon & Biodiversity Analytics Platform

A full-stack geospatial analytics dashboard for managing carbon sequestration and biodiversity conservation projects. Built as a hackathon challenge for the Darukaa.Earth Full-Stack Developer position.

---

## High-Level Architecture

```
┌──────────────────────────────────────────┐     ┌──────────────────────────────────────┐
│           Frontend (React / Vite)         │     │       Backend (FastAPI / Python)      │
│                                          │     │                                      │
│  React Router ─► PrivateRoute Guard      │     │  JWT Auth (bcrypt + python-jose)      │
│  Zustand ─► Auth state (localStorage)    │ ──► │  REST API (/api prefix)               │
│  React Query ─► Server data caching      │     │  SQLAlchemy + GeoAlchemy2             │
│  MapLibre GL JS ─► Interactive map       │     │  PostGIS polygon storage               │
│  Chart.js ─► Data visualization          │     │  Computed site analytics               │
│                                          │     │                                      │
│  Deployed on: Vercel                     │     │  Deployed on: Render.com              │
└──────────────────────────────────────────┘     └──────────────────────────────────────┘
                                                          │
                                                 ┌────────▼────────┐
                                                 │   PostgreSQL    │
                                                 │   + PostGIS     │
                                                 │  (Render / Docker)│
                                                 └─────────────────┘
```

### Technology Choices & Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mapping** | MapLibre GL JS | Open-source fork of Mapbox GL JS with identical API. Uses free OpenFreeMap tiles — no API key, no account, no credit card required. Same rendering engine, same layer/style spec. |
| **Charting** | Chart.js + react-chartjs-2 | Hackathon allows "Highcharts or Chart.js"; Chart.js is MIT-licensed with zero cost. |
| **State Management** | Zustand (auth) + React Query (server) | Zustand is minimal for client-only state; React Query handles caching, refetch, and loading states for API data. |
| **Map Drawing** | Custom draw tool (native) | Lightweight click-to-draw polygon tool built on MapLibre events. Exports standard GeoJSON for the backend. |
| **Geospatial DB** | PostgreSQL + PostGIS (GeoAlchemy2) | Industry-standard geospatial extensions; stores real `POLYGON` geometries with SRID 4326. |
| **Auth** | JWT + bcrypt | Stateless tokens suitable for SPA; 24h expiry with `JWT_SECRET` env var. |
| **Mock Data** | Server-generated analytics derived from stored base scores | Avoids needing a separate time-series store for the demo; realistic trends computed from `carbon_score`, `biodiversity_score`. |
| **CI/CD** | GitHub Actions → Vercel (frontend) + Render (backend) | Free tier platforms; automatic deployment on push to `main`. |

### Key Design Trade-offs

1. **MapLibre GL JS vs Mapbox GL JS**: MapLibre is the open-source fork of Mapbox GL JS, sharing the same rendering engine, style spec, and API. We chose MapLibre because:
   - Mapbox GL JS v2+ requires a paid API token even for development. MapLibre is 100% free with no API key.
   - Free tile providers (OpenFreeMap) mean zero infrastructure cost.
   - The code is a drop-in replacement — migrating to Mapbox GL JS only requires swapping the import and adding a token.

2. **Chart.js vs Highcharts**: The spec allows either. Chart.js is MIT-licensed (free for commercial use), lightweight (8KB gzipped for the modules used), and has excellent React integration via `react-chartjs-2`. Highcharts requires a paid license for commercial use.

3. **Zustand + React Query vs Redux**: Separating client-only state (auth) from server state (projects, sites) avoids the bolerplate of Redux. React Query gives automatic caching, background refetch, and loading/error states for free.

4. **Custom Draw Tool vs @mapbox/mapbox-gl-draw**: A lightweight native draw tool (~40 lines of logic) avoids the 200KB+ `@mapbox/mapbox-gl-draw` dependency and provides a simpler UX with an explicit "Finish & Save" button instead of complex mode toggling.

5. **Server-computed Analytics vs Time-series DB**: The `/sites/{id}/analytics` endpoint derives 12-month trends from stored base scores. This avoids needing InfluxDB/TimescaleDB for the demo while still showing realistic visualizations. In production, this would be replaced with actual time-series data.

## Database Schema

### `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INT` (PK) | Auto-increment primary key |
| `name` | `VARCHAR` | User's full name |
| `email` | `VARCHAR` (unique) | Login email |
| `role` | `VARCHAR` | Default: `Member` |
| `hashed_password` | `VARCHAR` | bcrypt hash |

### `projects`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INT` (PK) | Auto-increment |
| `name` | `VARCHAR` | Project name |
| `type` | `VARCHAR` | `Carbon` / `Biodiversity` / `Mixed` |
| `status` | `VARCHAR` | `Active` / `Draft` / `Inactive` |
| `description` | `TEXT` | Project description |
| `country` | `VARCHAR` | Country name |
| `carbon` | `FLOAT` | Target carbon (tCO2) |
| `verified` | `BOOLEAN` | Verification status |
| `start_date` | `TIMESTAMP` | Project start date |
| `last_updated` | `TIMESTAMP` | Last modified |
| `owner_id` | `INT` (FK) | → `users.id` |

### `sites`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INT` (PK) | Auto-increment |
| `name` | `VARCHAR` | Site name |
| `project_id` | `INT` (FK) | → `projects.id` |
| `area` | `FLOAT` | Hectares |
| `polygon` | `Geography('POLYGON', 4326)` | PostGIS geometry |
| `type` | `VARCHAR` | `Carbon` / `Biodiversity` / `Mixed` |
| `status` | `VARCHAR` | `Active` / `Monitoring` / `Pending` |
| `region` | `VARCHAR` | Geographic region |
| `country` | `VARCHAR` | Country name |
| `carbon_score` | `FLOAT` | Carbon sequestration score |
| `biodiversity_score` | `FLOAT` | Biodiversity index |
| `ndvi` | `FLOAT` | Normalized Difference Vegetation Index |
| `added_date` | `TIMESTAMP` | Date site was added |
| `last_updated` | `TIMESTAMP` | Last modified |

---

## Setup & Run Locally

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Docker** (for PostgreSQL + PostGIS)
- **Mapbox** account ([mapbox.com](https://www.mapbox.com)) — free tier works

### 1. Start PostgreSQL + PostGIS

```bash
cd backend
docker-compose up -d
```

Default credentials (from `docker-compose.yml`):
- User: `postgres`, Password: `password`, DB: `earth_keeper`

### 2. Environment Variables

**Frontend** — create `.env` in project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> **Note:** No map API token is needed — MapLibre GL JS uses free OpenFreeMap tiles.

**Backend** — set these in your shell or `.env` in `backend/`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/earth_keeper
JWT_SECRET=your-secret-key-here
CORS_ALLOW_ORIGINS=http://localhost:8080,http://localhost:5173
```

### 3. Run Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server auto-creates tables and PostGIS extensions on startup.

### 4. Run Frontend

```bash
npm install
npm run dev
```

Open: [http://localhost:8080](http://localhost:8080)

### 5. First Use

1. Navigate to `/register` to create an account
2. Login → redirected to `/dashboard`
3. Create a project → navigate to `/map` → draw a polygon → save as a new site
4. Click a site → view analytics charts

---

## API Reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | OAuth2 form login → JWT token |
| `GET` | `/projects/` | List all projects (auth required) |
| `GET` | `/projects/{id}` | Get a project by ID |
| `POST` | `/projects/` | Create a new project |
| `DELETE` | `/projects/{id}` | Delete a project |
| `GET` | `/sites/` | List all sites with GeoJSON polygons |
| `POST` | `/sites/` | Create a site (with `polygon_geojson`) |
| `GET` | `/sites/{id}/analytics` | Get computed monthly analytics |

---

## CI/CD Pipeline

### GitHub Actions Workflow

The pipeline is defined in `.github/workflows/deploy.yml` and triggers on every push to `main`:

```
Push to main
    │
    ├── Job 1: frontend-lint-and-build
    │   ├── checkout → setup Node 18 → npm ci
    │   ├── npm run lint        (ESLint + Prettier)
    │   ├── npm test            (Vitest unit tests)
    │   └── npm run build       (Vite production build)
    │
    ├── Job 2: backend-quality
    │   ├── checkout → setup Python 3.11
    │   ├── pip install requirements
    │   └── ruff check backend/app  (Python lint)
    │
    ├── Job 3: deploy-frontend-vercel (needs Job 1 + 2)
    │   └── Deploy to Vercel via amondnet/vercel-action
    │
    └── Job 4: deploy-backend-render
        └── Trigger Render deploy hook URL
```

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deployment authentication |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VITE_API_BASE_URL` | Backend API URL for production build |
| `RENDER_DEPLOY_HOOK_URL` | Render.com deploy webhook |
| `DATABASE_URL` | Production PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret for production |

---

## Developer Experience & Code Quality

### Pre-commit Hooks (Husky + lint-staged)

Every commit automatically runs:

1. **ESLint** with `--fix` on all `.ts/.tsx/.js/.jsx` files
2. **Prettier** with `--write` on all staged files

Configuration:
- `.husky/pre-commit` → `npx lint-staged`
- `.lintstagedrc` → ESLint fix + Prettier write rules
- `.prettierrc` → Single quotes, trailing commas, 100 char width
- `.eslintrc.cjs` → TypeScript + React Hooks + Prettier integration

### Backend Linting

- **Ruff** — configured via `backend/ruff.toml` (pyflakes, pycodestyle, import sorting)

### Testing

```bash
# Frontend
npm test          # Vitest (component + data tests)
npm run lint      # ESLint + Prettier check

# Backend
cd backend
ruff check app/   # Python linting
python test_api.py  # Integration smoke tests (requires running server)
```

---

## Deployment

### Frontend → Vercel

- `vercel.json` configures SPA rewrites (`/(.*) → /index.html`)
- Auto-deployed via GitHub Actions on push to `main`

### Backend → Render.com

- `render.yaml` defines the infrastructure blueprint (FastAPI web service + PostgreSQL with PostGIS)
- Auto-deployed via deploy hook or native GitHub integration

---

## Project Structure

```
├── .github/workflows/deploy.yml   # CI/CD pipeline
├── .husky/pre-commit              # Git pre-commit hook
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app + startup migrations
│   │   ├── models.py              # SQLAlchemy models (User, Project, Site)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── database.py            # PostgreSQL engine + session
│   │   ├── auth.py                # JWT + bcrypt utilities
│   │   └── routers/               # API route handlers
│   │       ├── auth.py            # Register + Login
│   │       ├── projects.py        # Project CRUD
│   │       └── sites.py           # Site CRUD + analytics
│   ├── docker-compose.yml         # PostGIS database container
│   ├── requirements.txt           # Python dependencies
│   └── ruff.toml                  # Python linter config
├── src/
│   ├── pages/                     # Route pages
│   │   ├── Dashboard.tsx          # Overview with stat cards + charts
│   │   ├── MapPage.tsx            # Mapbox GL JS interactive map
│   │   ├── Projects.tsx           # Project list with filters
│   │   ├── ProjectDetail.tsx      # Project analytics + sites table
│   │   ├── Sites.tsx              # Site list view
│   │   ├── SiteDetail.tsx         # Site analytics with 4 charts
│   │   ├── Analytics.tsx          # Portfolio-level analytics
│   │   ├── Settings.tsx           # User, security, notification settings
│   │   ├── Login.tsx              # Authentication
│   │   └── Register.tsx           # User registration
│   ├── components/
│   │   ├── layout/                # Shell components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── ui/                    # shadcn/ui + custom components
│   ├── store/authStore.ts         # Zustand auth state
│   ├── hooks/useApi.ts            # React Query data hooks
│   ├── services/api.ts            # Axios HTTP client
│   └── data/                      # Type definitions + mock data
├── vercel.json                    # Vercel SPA routing config
├── render.yaml                    # Render.com deployment blueprint
└── package.json
```
