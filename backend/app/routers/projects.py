from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/projects", tags=["projects"])

def project_to_response(project: models.Project) -> dict:
    # Ensure stable values for fields the frontend renders.
    start_dt = project.start_date or project.last_updated or datetime.utcnow()
    last_dt = project.last_updated or datetime.utcnow()
    owner_name = project.owner.name if getattr(project, "owner", None) is not None else ""

    return {
        "id": project.id,
        "name": project.name,
        "type": project.type or "Carbon",
        "status": project.status or "Active",
        "description": project.description or "",
        "country": project.country or "",
        "carbon": project.carbon or 0.0,
        "verified": bool(project.verified),
        "owner": owner_name,
        "owner_id": project.owner_id,
        "startDate": start_dt,
        "lastUpdated": last_dt,
    }

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Optionally restrict to projects owned by the user, for now returning all
    projects = db.query(models.Project).options(joinedload(models.Project.owner)).all()
    return [project_to_response(p) for p in projects]

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.owner))
        .filter(models.Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_to_response(project)

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Map frontend camelCase payload fields to the SQLAlchemy model.
    db_project = models.Project(
        name=project.name,
        type=project.type,
        status=project.status,
        description=project.description or "",
        country=project.country or "",
        carbon=project.carbon or 0.0,
        verified=project.verified,
        start_date=project.startDate or datetime.utcnow(),
        last_updated=datetime.utcnow(),
        owner_id=current_user.id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    # Reload owner for response mapping.
    db_project = (
        db.query(models.Project)
        .options(joinedload(models.Project.owner))
        .filter(models.Project.id == db_project.id)
        .first()
    )
    return project_to_response(db_project)

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted successfully"}
