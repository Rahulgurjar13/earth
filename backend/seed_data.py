"""
Seed script — populates the database with demo projects and sites.
Run after the backend is already running:

    python3 seed_data.py
"""

import requests
import sys

# Usage: python3 seed_data.py [base_url]
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api"

# ── 1. Register + Login ─────────────────────────────────────────
print("→ Registering seed user...")
requests.post(f"{BASE}/auth/register", json={
    "name": "Rahul Gurjar",
    "email": "demo@darukaa.earth",
    "password": "demo1234",
})

print("→ Logging in...")
r = requests.post(f"{BASE}/auth/login", data={
    "username": "demo@darukaa.earth",
    "password": "demo1234",
})
if r.status_code != 200:
    print("Login failed:", r.text)
    sys.exit(1)

token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# ── 2. Create Projects ──────────────────────────────────────────
projects = [
    {"name": "Amazon Reforestation", "type": "Carbon", "status": "Active",
     "description": "Large-scale reforestation across the Brazilian Amazon basin.",
     "country": "Brazil", "carbon": 18400, "verified": True},
    {"name": "Kerala Wetlands", "type": "Biodiversity", "status": "Active",
     "description": "Conservation of critical wetland ecosystems along the Kerala backwaters.",
     "country": "India", "carbon": 9200, "verified": True},
    {"name": "Borneo Peatland", "type": "Mixed", "status": "Active",
     "description": "Peatland rewetting and conservation in Indonesian Borneo.",
     "country": "Indonesia", "carbon": 12800, "verified": False},
    {"name": "Sahel Agroforestry", "type": "Carbon", "status": "Draft",
     "description": "Farmer-managed natural regeneration across the Sahel belt.",
     "country": "Niger", "carbon": 5400, "verified": False},
    {"name": "Congo Basin Reserve", "type": "Biodiversity", "status": "Active",
     "description": "Protected area management in the Congo Basin rainforest.",
     "country": "DR Congo", "carbon": 2491, "verified": False},
]

project_ids = []
for p in projects:
    r = requests.post(f"{BASE}/projects/", json=p, headers=H)
    pid = r.json().get("id")
    project_ids.append(pid)
    print(f"  ✓ Project '{p['name']}' → id={pid}")

# ── 3. Create Sites (with real polygons) ─────────────────────────
sites = [
    # Amazon Reforestation sites
    {"name": "Alpha-7", "project_idx": 0, "type": "Carbon", "area": 2400,
     "carbon_score": 847, "biodiversity_score": 78.4, "ndvi": 0.73,
     "region": "Amazonas", "country": "Brazil",
     "polygon": {"type": "Polygon", "coordinates": [[[-60.3,-3.0],[-60.1,-3.0],[-60.1,-3.2],[-60.3,-3.2],[-60.3,-3.0]]]}},
    {"name": "Alpha-12", "project_idx": 0, "type": "Carbon", "area": 1800,
     "carbon_score": 623, "biodiversity_score": 72.1, "ndvi": 0.68,
     "region": "Pará", "country": "Brazil",
     "polygon": {"type": "Polygon", "coordinates": [[[-55.9,-2.4],[-55.7,-2.4],[-55.7,-2.6],[-55.9,-2.6],[-55.9,-2.4]]]}},
    {"name": "Alpha-19", "project_idx": 0, "type": "Carbon", "area": 3100,
     "carbon_score": 912, "biodiversity_score": 81.5, "ndvi": 0.76,
     "region": "Amazonas", "country": "Brazil",
     "polygon": {"type": "Polygon", "coordinates": [[[-62.2,-3.7],[-62.0,-3.7],[-62.0,-3.9],[-62.2,-3.9],[-62.2,-3.7]]]}},

    # Kerala Wetlands sites
    {"name": "Kochi-West", "project_idx": 1, "type": "Biodiversity", "area": 1200,
     "carbon_score": 410, "biodiversity_score": 85.2, "ndvi": 0.81,
     "region": "Kerala", "country": "India",
     "polygon": {"type": "Polygon", "coordinates": [[[76.2,10.0],[76.4,10.0],[76.4,9.9],[76.2,9.9],[76.2,10.0]]]}},
    {"name": "Alleppey-S", "project_idx": 1, "type": "Biodiversity", "area": 980,
     "carbon_score": 345, "biodiversity_score": 79.8, "ndvi": 0.77,
     "region": "Kerala", "country": "India",
     "polygon": {"type": "Polygon", "coordinates": [[[76.25,9.55],[76.45,9.55],[76.45,9.45],[76.25,9.45],[76.25,9.55]]]}},
    {"name": "Kumarakom", "project_idx": 1, "type": "Biodiversity", "area": 1560,
     "carbon_score": 478, "biodiversity_score": 82.1, "ndvi": 0.79,
     "region": "Kerala", "country": "India",
     "polygon": {"type": "Polygon", "coordinates": [[[76.33,9.67],[76.53,9.67],[76.53,9.57],[76.33,9.57],[76.33,9.67]]]}},

    # Borneo Peatland sites
    {"name": "Kalimantan-N1", "project_idx": 2, "type": "Mixed", "area": 4200,
     "carbon_score": 1120, "biodiversity_score": 66.3, "ndvi": 0.64,
     "region": "Kalimantan", "country": "Indonesia",
     "polygon": {"type": "Polygon", "coordinates": [[[114.3,1.3],[114.7,1.3],[114.7,1.1],[114.3,1.1],[114.3,1.3]]]}},
    {"name": "Kalimantan-S3", "project_idx": 2, "type": "Mixed", "area": 3600,
     "carbon_score": 890, "biodiversity_score": 61.7, "ndvi": 0.61,
     "region": "Kalimantan", "country": "Indonesia",
     "polygon": {"type": "Polygon", "coordinates": [[[115.0,0.6],[115.4,0.6],[115.4,0.4],[115.0,0.4],[115.0,0.6]]]}},
    {"name": "Sarawak-E", "project_idx": 2, "type": "Mixed", "area": 2800,
     "carbon_score": 720, "biodiversity_score": 58.9, "ndvi": 0.58,
     "region": "Sarawak", "country": "Malaysia",
     "polygon": {"type": "Polygon", "coordinates": [[[112.6,2.4],[113.0,2.4],[113.0,2.2],[112.6,2.2],[112.6,2.4]]]}},

    # Sahel Agroforestry sites
    {"name": "Niamey-Belt", "project_idx": 3, "type": "Carbon", "area": 1800,
     "carbon_score": 340, "biodiversity_score": 45.2, "ndvi": 0.42,
     "region": "Niamey", "country": "Niger",
     "polygon": {"type": "Polygon", "coordinates": [[[2.0,13.6],[2.2,13.6],[2.2,13.4],[2.0,13.4],[2.0,13.6]]]}},
    {"name": "Zinder-N", "project_idx": 3, "type": "Carbon", "area": 2200,
     "carbon_score": 280, "biodiversity_score": 42.8, "ndvi": 0.39,
     "region": "Zinder", "country": "Niger",
     "polygon": {"type": "Polygon", "coordinates": [[[8.88,13.9],[9.08,13.9],[9.08,13.7],[8.88,13.7],[8.88,13.9]]]}},

    # Congo Basin Reserve sites
    {"name": "Kisangani-Core", "project_idx": 4, "type": "Biodiversity", "area": 5200,
     "carbon_score": 680, "biodiversity_score": 88.4, "ndvi": 0.82,
     "region": "Tshopo", "country": "DR Congo",
     "polygon": {"type": "Polygon", "coordinates": [[[25.0,0.6],[25.4,0.6],[25.4,0.4],[25.0,0.4],[25.0,0.6]]]}},
    {"name": "Mbandaka-S", "project_idx": 4, "type": "Biodiversity", "area": 3800,
     "carbon_score": 520, "biodiversity_score": 84.1, "ndvi": 0.79,
     "region": "Équateur", "country": "DR Congo",
     "polygon": {"type": "Polygon", "coordinates": [[[18.1,0.15],[18.5,0.15],[18.5,-0.05],[18.1,-0.05],[18.1,0.15]]]}},
    {"name": "Epulu-Reserve", "project_idx": 4, "type": "Biodiversity", "area": 4100,
     "carbon_score": 590, "biodiversity_score": 91.2, "ndvi": 0.85,
     "region": "Ituri", "country": "DR Congo",
     "polygon": {"type": "Polygon", "coordinates": [[[28.4,1.5],[28.8,1.5],[28.8,1.3],[28.4,1.3],[28.4,1.5]]]}},
]

for s in sites:
    body = {
        "name": s["name"],
        "project_id": project_ids[s["project_idx"]],
        "type": s["type"],
        "area": s["area"],
        "carbon_score": s["carbon_score"],
        "biodiversity_score": s["biodiversity_score"],
        "ndvi": s["ndvi"],
        "region": s["region"],
        "country": s["country"],
        "polygon_geojson": s["polygon"],
    }
    r = requests.post(f"{BASE}/sites/", json=body, headers=H)
    if r.status_code in (200, 201):
        print(f"  ✓ Site '{s['name']}' → id={r.json().get('id')}")
    else:
        print(f"  ✗ Site '{s['name']}' failed: {r.status_code} {r.text}")

print("\n✅ Database seeded! Refresh the dashboard to see data.")
