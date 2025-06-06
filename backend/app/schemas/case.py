from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class ViolationType(str, Enum):
    FORCED_DISPLACEMENT = "forced_displacement"
    PROPERTY_DESTRUCTION = "property_destruction"
    ARBITRARY_DETENTION = "arbitrary_detention"
    TORTURE = "torture"
    EXTRAJUDICIAL_KILLING = "extrajudicial_killing"
    ENFORCED_DISAPPEARANCE = "enforced_disappearance"
    SEXUAL_VIOLENCE = "sexual_violence"
    CHILD_RECRUITMENT = "child_recruitment"
    OTHER = "other"


class CaseStatus(str, Enum):
    NEW = "new"
    UNDER_INVESTIGATION = "under_investigation"
    PENDING_EVIDENCE = "pending_evidence"
    LEGAL_ACTION = "legal_action"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Coordinates(BaseModel):
    type: str = "Point"
    coordinates: List[float]


class Location(BaseModel):
    country: str
    region: str
    coordinates: Optional[Coordinates] = None


class Evidence(BaseModel):
    type: str
    url: str
    description: str
    date_captured: datetime


class Perpetrator(BaseModel):
    name: str
    type: str


class CaseBase(BaseModel):
    title: str
    description: str
    violation_types: List[ViolationType]
    status: CaseStatus
    priority: Priority
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str] = []  # List of victim IDs
    perpetrators: List[Perpetrator] = []
    evidence: List[Evidence] = []


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    violation_types: Optional[List[ViolationType]] = None
    status: Optional[CaseStatus] = None
    priority: Optional[Priority] = None
    location: Optional[Location] = None
    date_occurred: Optional[datetime] = None
    date_reported: Optional[datetime] = None
    victims: Optional[List[str]] = None
    perpetrators: Optional[List[Perpetrator]] = None
    evidence: Optional[List[Evidence]] = None


class CaseInDB(CaseBase):
    id: str = Field(..., alias="_id")
    case_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True


class Case(CaseInDB):
    pass
