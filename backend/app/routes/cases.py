from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import mongodb
from app.schemas.case import Case, CaseCreate, CaseUpdate, CaseStatus

router = APIRouter()


@router.post("/", response_model=Case, status_code=status.HTTP_201_CREATED)
async def create_case(case: CaseCreate = Body(...)):
    """
    Create a new human rights case.
    
    This endpoint allows authorized users to create a new case with all relevant details
    including violation types, location, dates, and associated evidence.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Generate a unique case ID with prefix
    current_year = datetime.now().year
    case_id = f"HRM-{current_year}-{str(uuid.uuid4())[:8]}"
    
    # Prepare case data for insertion
    case_data = case.dict()
    case_data.update({
        "case_id": case_id,
        "created_by": "system",  # In a real app, this would be the authenticated user's ID
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Insert case into database
    result = cases_collection.insert_one(case_data)
    
    # Return the created case with its ID
    created_case = cases_collection.find_one({"_id": result.inserted_id})
    return created_case


@router.get("/{case_id}", response_model=Case)
async def get_case(case_id: str):
    """
    Retrieve a specific case by its ID.
    
    This endpoint returns detailed information about a specific human rights case,
    including all associated data such as victims, evidence, and status.
    """
    cases_collection = mongodb.get_collection("cases")
    case = cases_collection.find_one({"case_id": case_id})
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
    
    return case


@router.get("/", response_model=List[Case])
async def list_cases(
    status: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    """
    List all cases with optional filtering.
    
    This endpoint returns a list of human rights cases, with support for filtering
    by various criteria such as status, violation type, location, and date range.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Build query filters
    query = {}
    
    if status:
        query["status"] = status
    
    if violation_type:
        query["violation_types"] = violation_type
    
    if country:
        query["location.country"] = country
    
    # Date filtering
    date_query = {}
    if start_date:
        date_query["$gte"] = datetime.fromisoformat(start_date)
    if end_date:
        date_query["$lte"] = datetime.fromisoformat(end_date)
    
    if date_query:
        query["date_occurred"] = date_query
    
    # Execute query with pagination
    cases = list(cases_collection.find(query).skip(skip).limit(limit))
    return cases


@router.patch("/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate = Body(...)):
    """
    Update a specific case.
    
    This endpoint allows authorized users to update various aspects of a case,
    including its status, evidence, and other details.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Check if case exists
    existing_case = cases_collection.find_one({"case_id": case_id})
    if not existing_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found"
        )
    
    # Filter out None values from the update
    update_data = {k: v for k, v in case_update.dict(exclude_unset=True).items() if v is not None}
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the case
    cases_collection.update_one(
        {"case_id": case_id},
        {"$set": update_data}
    )
    
    # Return the updated case
    updated_case = cases_collection.find_one({"case_id": case_id})
    return updated_case
