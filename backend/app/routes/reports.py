from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import mongodb
from app.schemas.report import Report, ReportCreate, ReportUpdate, ReportStatus

router = APIRouter()


@router.post("/", response_model=Report, status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate = Body(...)):
    reports_collection = mongodb.get_collection("incident_reports")
    
    try:
        report_id = f"IR-{datetime.now().year}-{str(uuid.uuid4())[:8]}"
        report_data = report.dict()
        if not report_data.get("report_id"):
            report_data["report_id"] = report_id
        
        report_data.update({
            "created_at": datetime.utcnow(),
            "status": ReportStatus.NEW
        })
        
        result = reports_collection.insert_one(report_data)
        created_report = reports_collection.find_one({"_id": result.inserted_id})
        return created_report
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )


@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str):
    """
    Retrieve a specific incident report by its ID.
    
    This endpoint returns detailed information about a specific incident report,
    including all associated evidence and metadata.
    """
    reports_collection = mongodb.get_collection("incident_reports")
    report = reports_collection.find_one({"report_id": report_id})
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    return report


@router.get("/", response_model=List[Report])
async def list_reports(
    status: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    """
    List all incident reports with optional filtering.
    
    This endpoint returns a list of incident reports, with support for filtering
    by various criteria such as status, location, and date range.
    """
    reports_collection = mongodb.get_collection("incident_reports")
    
    # Build query filters
    query = {}
    
    if status:
        query["status"] = status
    
    if country:
        query["incident_details.location.country"] = country
    
    if violation_type:
        query["incident_details.violation_types"] = violation_type
    
    # Date filtering
    date_query = {}
    if start_date:
        date_query["$gte"] = datetime.fromisoformat(start_date)
    if end_date:
        date_query["$lte"] = datetime.fromisoformat(end_date)
    
    if date_query:
        query["incident_details.date"] = date_query
    
    # Execute query with pagination
    reports = list(reports_collection.find(query).skip(skip).limit(limit))
    return reports


@router.patch("/{report_id}", response_model=Report)
async def update_report(report_id: str, report_update: ReportUpdate = Body(...)):
    """
    Update a specific incident report.
    
    This endpoint allows authorized users to update various aspects of a report,
    including its status, evidence, and other details.
    """
    reports_collection = mongodb.get_collection("incident_reports")
    
    # Check if report exists
    existing_report = reports_collection.find_one({"report_id": report_id})
    if not existing_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    # Filter out None values from the update
    update_data = {k: v for k, v in report_update.dict(exclude_unset=True).items() if v is not None}
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the report
    reports_collection.update_one(
        {"report_id": report_id},
        {"$set": update_data}
    )
    
    # Return the updated report
    updated_report = reports_collection.find_one({"report_id": report_id})
    return updated_report


@router.get("/analytics", response_model=dict)
async def get_report_analytics():
    """
    Get analytics data for incident reports.
    
    This endpoint provides aggregated statistics about incident reports,
    such as counts by violation type, status, and location.
    """
    reports_collection = mongodb.get_collection("incident_reports")
    
    # Aggregate reports by violation type
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {
            "_id": "$incident_details.violation_types",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    violation_counts = list(reports_collection.aggregate(pipeline))
    
    # Format the results
    result = {
        "total_reports": reports_collection.count_documents({}),
        "by_violation_type": {item["_id"]: item["count"] for item in violation_counts},
        "by_status": {
            status: reports_collection.count_documents({"status": status})
            for status in [s.value for s in ReportStatus]
        }
    }
    
    return result
