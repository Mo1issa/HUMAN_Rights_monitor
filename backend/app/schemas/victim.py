from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class IndividualType(str, Enum):
    VICTIM = "victim"
    WITNESS = "witness"
    BOTH = "both"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Demographics(BaseModel):
    gender: Optional[Gender] = None
    age: Optional[int] = None
    ethnicity: Optional[str] = None
    occupation: Optional[str] = None


class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    secure_messaging: Optional[str] = None


class RiskAssessment(BaseModel):
    level: RiskLevel
    threats: List[str] = []
    protection_needed: bool = False
    notes: Optional[str] = None


class SupportService(BaseModel):
    type: str  # legal, medical, psychological, relocation
    provider: str
    status: str  # active, completed, pending
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class VictimBase(BaseModel):
    type: IndividualType
    anonymous: bool = False
    pseudonym: Optional[str] = None
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None
    cases_involved: List[str] = []  # List of case IDs
    risk_assessment: Optional[RiskAssessment] = None
    support_services: List[SupportService] = []


class VictimCreate(VictimBase):
    pass


class VictimUpdate(BaseModel):
    type: Optional[IndividualType] = None
    anonymous: Optional[bool] = None
    pseudonym: Optional[str] = None
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None
    cases_involved: Optional[List[str]] = None
    risk_assessment: Optional[RiskAssessment] = None
    support_services: Optional[List[SupportService]] = None


class VictimInDB(VictimBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True


class Victim(VictimInDB):
    pass
