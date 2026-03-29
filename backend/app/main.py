from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import os
from app.database import engine, Base
from app.routers import auth, projects, sites

# Ensure PostGIS extension exists and create tables
try:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning on startup table/extension creation: {e}")

# Lightweight schema evolution for local dev.
# This avoids breaking the UI when new columns are added to SQLAlchemy models.
try:
    with engine.begin() as conn:
        # Projects
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';"))
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '';"))
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS carbon DOUBLE PRECISION DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))

        # Sites
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Carbon';"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Unknown';"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS ndvi DOUBLE PRECISION DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        conn.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
except Exception as e:
    print(f"Warning on startup migration: {e}")

app = FastAPI(title="Earth Keeper Backend", version="1.0.0", root_path="/api")

# Configure CORS for the frontend development server
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

cors_origins_env = os.environ.get("CORS_ALLOW_ORIGINS")
allow_origins = default_origins
if cors_origins_env:
    # Comma-separated list of origins, e.g. "https://example.com,https://admin.example.com"
    allow_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(sites.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Earth Keeper API!"}
