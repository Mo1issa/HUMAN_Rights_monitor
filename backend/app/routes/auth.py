from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Dict
from datetime import datetime, timedelta

from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.database import mongodb

router = APIRouter()


@router.post("/login", response_model=Dict[str, str])
async def login(username: str = Body(...), password: str = Body(...)):
    """
    Authenticate a user and return an access token.
    
    This endpoint validates user credentials and returns a JWT token
    for authenticated API access.
    """
    users_collection = mongodb.get_collection("users")
    user = users_collection.find_one({"username": username})
    
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        subject=str(user["_id"]),
        expires_delta=timedelta(minutes=60 * 24 * 7)  # 7 days
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    username: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(...),
    role: str = Body(...)
):
    """
    Register a new user.
    
    This endpoint creates a new user account with the provided credentials
    and role information.
    """
    users_collection = mongodb.get_collection("users")
    
    # Check if username already exists
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    user_data = {
        "username": username,
        "hashed_password": get_password_hash(password),
        "full_name": full_name,
        "role": role,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    
    return {"id": str(result.inserted_id), "message": "User registered successfully"}
