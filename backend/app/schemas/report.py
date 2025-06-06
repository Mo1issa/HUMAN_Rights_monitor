from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class ReporterType(str, Enum):
    VICTIM = "victim"
    WITNESS = "witness"
    NGO = "ngo"
    JOURNALIST = "journalist"
    ANONYMOUS = "anonymous"
    OTHER = "other"


class ReportStatus(str, Enum):
    NEW = "new"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    MERGED = "merged"  # When merged with an existing case


class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    preferred_contact: Optional[str] = None


class IncidentLocation(BaseModel):
    country: str
    city: str
    coordinates: Optional[Dict[str, Any]] = None


class IncidentDetails(BaseModel):
    date: datetime
    location: IncidentLocation
    description: str
    violation_types: List[str]


class ReportEvidence(BaseModel):
    type: str  # photo, video, document, audio
    url: str
    description: Optional[str] = None


class ReportBase(BaseModel):
    report_id: Optional[str] = None  # Will be generated if not provided
    reporter_type: ReporterType
    anonymous: bool = False
    contact_info: Optional[ContactInfo] = None
    incident_details: IncidentDetails
    evidence: List[ReportEvidence] = []
    status: ReportStatus = ReportStatus.NEW


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    reporter_type: Optional[ReporterType] = None
    anonymous: Optional[bool] = None
    contact_info: Optional[ContactInfo] = None
    incident_details: Optional[IncidentDetails] = None
    evidence: Optional[List[ReportEvidence]] = None
    status: Optional[ReportStatus] = None
    assigned_to: Optional[str] = None


class ReportInDB(ReportBase):
    id: str = Field(..., alias="_id")
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True


class Report(ReportInDB):
    pass
