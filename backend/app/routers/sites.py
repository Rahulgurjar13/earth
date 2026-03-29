from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/sites", tags=["sites"])

@router.get("/")
def get_sites(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    sites = db.query(models.Site, func.ST_AsGeoJSON(models.Site.polygon).label('geojson_polygon')).all()
    results = []
    for site, geojson_polygon in sites:
        res = {
            "id": site.id,
            "name": site.name,
            "project_id": site.project_id,
            "area": site.area,
            "type": site.type or "Carbon",
            "status": site.status or "Active",
            "region": site.region or "Unknown",
            "country": site.country or "Unknown",
            "carbon_score": site.carbon_score,
            "biodiversity_score": site.biodiversity_score,
            "ndvi": site.ndvi or 0.0,
            "polygon_geojson": json.loads(geojson_polygon) if geojson_polygon else None,
            "lastUpdated": site.last_updated,
        }
        results.append(res)
    return results

@router.post("/")
def create_site(site: schemas.SiteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # If the frontend is creating a demo site, it often omits computed scores.
    # Populate them deterministically so the UI charts are meaningful.
    type_to_defaults = {
        "Carbon": {"carbon_score": 12.0, "biodiversity_score": 30.0, "ndvi": 0.48},
        "Biodiversity": {"carbon_score": 4.0, "biodiversity_score": 70.0, "ndvi": 0.68},
        "Mixed": {"carbon_score": 8.0, "biodiversity_score": 50.0, "ndvi": 0.58},
    }
    defaults = type_to_defaults.get(site.type, type_to_defaults["Carbon"])
    area = site.area or 0.0

    carbon_score = site.carbon_score
    biodiversity_score = site.biodiversity_score
    ndvi = site.ndvi
    if carbon_score == 0.0 and biodiversity_score == 0.0:
        carbon_score = area * defaults["carbon_score"]
        biodiversity_score = min(100.0, (area / 100.0) * defaults["biodiversity_score"])
        ndvi = defaults["ndvi"]

    # Convert GeoJSON dict to JSON string for PostGIS ST_GeomFromGeoJSON
    geojson_str = json.dumps(site.polygon_geojson)
    
    db_site = models.Site(
        name=site.name,
        project_id=site.project_id,
        area=site.area,
        type=site.type,
        status=site.status,
        region=site.region,
        country=site.country,
        carbon_score=carbon_score,
        biodiversity_score=biodiversity_score,
        ndvi=ndvi,
        polygon=func.ST_GeomFromGeoJSON(geojson_str)
    )
    
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    
    # Reload with GeoJSON
    reloaded = (
        db.query(models.Site, func.ST_AsGeoJSON(models.Site.polygon).label("geojson_polygon"))
        .filter(models.Site.id == db_site.id)
        .first()
    )
    if not reloaded:
        raise HTTPException(status_code=500, detail="Failed to reload created site")

    site_model, geojson_polygon = reloaded
    return {
        "id": site_model.id,
        "name": site_model.name,
        "project_id": site_model.project_id,
        "area": site_model.area,
        "type": site_model.type,
        "status": site_model.status,
        "region": site_model.region,
        "country": site_model.country,
        "carbon_score": site_model.carbon_score,
        "biodiversity_score": site_model.biodiversity_score,
        "ndvi": site_model.ndvi,
        "polygon_geojson": json.loads(geojson_polygon) if geojson_polygon else None,
        "lastUpdated": site_model.last_updated,
    }

@router.get("/{site_id}/analytics")
def get_site_analytics(site_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    carbon_base = site.carbon_score or 0.0
    biod_base = site.biodiversity_score or 0.0
    ndvi_base = site.ndvi or 0.0

    carbon = [
        carbon_base * 0.8,
        carbon_base * 0.82,
        carbon_base * 0.85,
        carbon_base * 0.88,
        carbon_base * 0.9,
        carbon_base * 0.92,
        carbon_base * 0.94,
        carbon_base * 0.95,
        carbon_base * 0.97,
        carbon_base * 0.98,
        carbon_base * 0.99,
        carbon_base,
    ]
    biodiversity = [
        biod_base * 0.9,
        biod_base * 0.9,
        biod_base * 0.91,
        biod_base * 0.93,
        biod_base * 0.95,
        biod_base * 0.96,
        biod_base * 0.96,
        biod_base * 0.97,
        biod_base * 0.98,
        biod_base * 0.98,
        biod_base * 0.99,
        biod_base,
    ]

    # NDVI stays in [0, 1] (for chart scale + quality thresholds).
    ndvi = [max(0.0, min(1.0, ndvi_base * m)) for m in [0.92, 0.95, 0.97, 0.99, 1.01, 1.05, 1.07, 1.06, 1.04, 1.02, 0.98, 0.95]]

    rainfall = [max(0.0, 200 + (v * 220)) for v in ndvi]  # mm-ish
    temperature = [round(22 + (v * 10), 2) for v in ndvi]  # degrees C-ish

    def quality_from_v(v: float) -> str:
        if v >= 0.7:
            return "Good"
        if v >= 0.55:
            return "Fair"
        return "Poor"

    quality = [quality_from_v(v) for v in ndvi]

    return {
        "site_id": site_id,
        "site_name": site.name,
        "months": months,
        "carbon": carbon,
        "biodiversity": biodiversity,
        "ndvi": ndvi,
        "rainfall": rainfall,
        "temperature": temperature,
        "quality": quality,
    }
