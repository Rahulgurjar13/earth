from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="Member")
    hashed_password = Column(String)

    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    status = Column(String, default="Active")
    description = Column(Text, default="")
    country = Column(String, default="")
    carbon = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)
    # UI timestamps
    start_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # Stored for UI badges + map colors
    type = Column(String, default="Carbon")  # Carbon | Biodiversity | Mixed
    status = Column(String, default="Active")  # Active | Monitoring | Pending | ...
    region = Column(String, default="Unknown")
    country = Column(String, default="Unknown")
    project_id = Column(Integer, ForeignKey("projects.id"))
    area = Column(Float)
    
    # Store polygons natively using SRID 4326 (WGS 84)
    polygon = Column(Geography('POLYGON', srid=4326))
    
    carbon_score = Column(Float, default=0.0)
    biodiversity_score = Column(Float, default=0.0)
    ndvi = Column(Float, default=0.0)
    added_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sites")
