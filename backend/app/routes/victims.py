from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import mongodb
from app.schemas.victim import Victim, VictimCreate, VictimUpdate, RiskLevel

router = APIRouter()


@router.post("/", response_model=Victim, status_code=status.HTTP_201_CREATED)
async def create_victim(victim: VictimCreate = Body(...)):
    """
    Add a new victim or witness to the database.
    
    This endpoint allows authorized users to add a new victim or witness record
    with all relevant details including demographics, risk assessment, and support services.
    """
    victims_collection = mongodb.get_collection("victims")
    
    # Prepare victim data for insertion
    victim_data = victim.dict()
    victim_data.update({
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Insert victim into database
    result = victims_collection.insert_one(victim_data)
    
    # Return the created victim with its ID
    created_victim = victims_collection.find_one({"_id": result.inserted_id})
    return created_victim


@router.get("/{victim_id}", response_model=Victim)
async def get_victim(victim_id: str):
    """
    Retrieve a specific victim/witness by ID.
    
    This endpoint returns detailed information about a specific victim or witness,
    including all associated data such as demographics, risk assessment, and support services.
    """
    victims_collection = mongodb.get_collection("victims")
    victim = victims_collection.find_one({"_id": victim_id})
    
    if not victim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Victim with ID {victim_id} not found"
        )
    
    return victim


@router.patch("/{victim_id}", response_model=Victim)
async def update_victim(victim_id: str, victim_update: VictimUpdate = Body(...)):
    """
    Update a specific victim/witness record.
    
    This endpoint allows authorized users to update various aspects of a victim record,
    including risk level, support services, and other details.
    """
    victims_collection = mongodb.get_collection("victims")
    
    # Check if victim exists
    existing_victim = victims_collection.find_one({"_id": victim_id})
    if not existing_victim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Victim with ID {victim_id} not found"
        )
    
    # Filter out None values from the update
    update_data = {k: v for k, v in victim_update.dict(exclude_unset=True).items() if v is not None}
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the victim
    victims_collection.update_one(
        {"_id": victim_id},
        {"$set": update_data}
    )
    
    # Return the updated victim
    updated_victim = victims_collection.find_one({"_id": victim_id})
    return updated_victim


@router.get("/case/{case_id}", response_model=List[Victim])
async def list_victims_by_case(case_id: str):
    """
    List all victims/witnesses linked to a specific case.
    
    This endpoint returns a list of victims and witnesses that are associated
    with a particular human rights case.
    """
    victims_collection = mongodb.get_collection("victims")
    
    # Query victims by case ID
    victims = list(victims_collection.find({"cases_involved": case_id}))
    return victims


@router.patch("/{victim_id}/risk", response_model=Victim)
async def update_risk_level(
    victim_id: str, 
    risk_level: RiskLevel = Body(..., embed=True),
    threats: List[str] = Body([], embed=True),
    protection_needed: bool = Body(False, embed=True)
):
    """
    Update the risk assessment for a victim/witness.
    
    This endpoint allows authorized users to update the risk level and related
    information for a specific victim or witness.
    """
    victims_collection = mongodb.get_collection("victims")
    
    # Check if victim exists
    existing_victim = victims_collection.find_one({"_id": victim_id})
    if not existing_victim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Victim with ID {victim_id} not found"
        )
    
    # Update risk assessment
    risk_assessment = {
        "level": risk_level,
        "threats": threats,
        "protection_needed": protection_needed,
        "updated_at": datetime.utcnow()
    }
    
    # Update the victim
    victims_collection.update_one(
        {"_id": victim_id},
        {
            "$set": {
                "risk_assessment": risk_assessment,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Return the updated victim
    updated_victim = victims_collection.find_one({"_id": victim_id})
    return updated_victim
