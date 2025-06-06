from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field


class TimelineData(BaseModel):
    date: date
    count: int
    violation_type: Optional[str] = None


class ViolationTypeCount(BaseModel):
    violation_type: str
    count: int


class GeoData(BaseModel):
    country: str
    region: Optional[str] = None
    coordinates: List[float]
    count: int
    violation_types: Dict[str, int]


class AnalyticsParams(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    country: Optional[str] = None
    region: Optional[str] = None
    violation_type: Optional[str] = None


class AnalyticsResponse(BaseModel):
    total_cases: int
    total_reports: int
    total_victims: int
    violation_counts: List[ViolationTypeCount]
    timeline_data: Optional[List[TimelineData]] = None
    geo_data: Optional[List[GeoData]] = None
