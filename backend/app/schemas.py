from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Member"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True, extra="ignore")

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class ProjectBase(BaseModel):
    name: str
    type: str
    status: str = "Active"
    description: Optional[str] = ""
    country: Optional[str] = ""
    carbon: float = 0.0
    verified: bool = False
    startDate: Optional[datetime] = None
    lastUpdated: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")

class ProjectCreate(ProjectBase):
    # Frontend doesn't send `owner` (it comes from the JWT user), so omit it.
    model_config = ConfigDict(extra="ignore")

class ProjectResponse(ProjectBase):
    id: int
    owner: Optional[str] = ""
    owner_id: Optional[int] = None

    model_config = ConfigDict(extra="ignore")

class SiteBase(BaseModel):
    name: str
    area: float
    carbon_score: float = 0.0
    biodiversity_score: float = 0.0
    type: str = "Carbon"  # Carbon | Biodiversity | Mixed
    status: str = "Active"  # Active | Monitoring | Pending | ...
    region: str = "Unknown"
    country: str = "Unknown"
    ndvi: float = 0.0

    model_config = ConfigDict(extra="ignore")

class SiteCreate(SiteBase):
    project_id: int
    # Receive GeoJSON polygon feature coordinates
    polygon_geojson: Any

class SiteResponse(SiteBase):
    id: int
    project_id: int
    polygon_geojson: Any = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")
