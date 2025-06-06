from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.database import mongodb
from app.schemas.analytics import AnalyticsResponse, ViolationTypeCount, TimelineData, GeoData

router = APIRouter()


@router.get("/violations", response_model=List[ViolationTypeCount])
async def get_violation_counts():
    """
    Get counts of violations by type.
    
    This endpoint provides aggregated statistics about the number of human rights
    violations recorded in the system, grouped by violation type.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Aggregate cases by violation type
    pipeline = [
        {"$unwind": "$violation_types"},
        {"$group": {
            "_id": "$violation_types",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    violation_counts = list(cases_collection.aggregate(pipeline))
    
    # Format the results
    result = [
        ViolationTypeCount(violation_type=item["_id"], count=item["count"])
        for item in violation_counts
    ]
    
    return result


@router.get("/geodata", response_model=List[GeoData])
async def get_geo_data(
    country: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None)
):
    """
    Get geographical data for violations.
    
    This endpoint provides location-based data for human rights violations,
    which can be used for map visualizations.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Build match stage for filtering
    match_stage = {}
    if country:
        match_stage["location.country"] = country
    if violation_type:
        match_stage["violation_types"] = violation_type
    
    # Aggregation pipeline
    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})
    
    pipeline.extend([
        {"$group": {
            "_id": {
                "country": "$location.country",
                "region": "$location.region",
                "coordinates": "$location.coordinates.coordinates"
            },
            "count": {"$sum": 1},
            "violations": {"$push": "$violation_types"}
        }},
        {"$project": {
            "country": "$_id.country",
            "region": "$_id.region",
            "coordinates": "$_id.coordinates",
            "count": 1,
            "violations": {"$reduce": {
                "input": "$violations",
                "initialValue": [],
                "in": {"$concatArrays": ["$$value", "$$this"]}
            }}
        }}
    ])
    
    geo_data = list(cases_collection.aggregate(pipeline))
    
    # Process the results to count violation types
    result = []
    for item in geo_data:
        # Count occurrences of each violation type
        violation_counts = {}
        for violation in item["violations"]:
            if isinstance(violation, list):
                for v in violation:
                    violation_counts[v] = violation_counts.get(v, 0) + 1
            else:
                violation_counts[violation] = violation_counts.get(violation, 0) + 1
        
        # Create GeoData object
        geo_item = GeoData(
            country=item["country"],
            region=item.get("region"),
            coordinates=item["coordinates"],
            count=item["count"],
            violation_types=violation_counts
        )
        result.append(geo_item)
    
    return result


@router.get("/timeline", response_model=List[TimelineData])
async def get_timeline_data(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    interval: str = Query("month", description="Interval for grouping: day, week, month, year")
):
    """
    Get timeline data for violations.
    
    This endpoint provides time-series data for human rights violations,
    which can be used for timeline visualizations.
    """
    cases_collection = mongodb.get_collection("cases")
    
    # Parse dates
    start = datetime.fromisoformat(start_date) if start_date else datetime.now() - timedelta(days=365)
    end = datetime.fromisoformat(end_date) if end_date else datetime.now()
    
    # Build match stage for filtering
    match_stage = {
        "date_occurred": {
            "$gte": start,
            "$lte": end
        }
    }
    if violation_type:
        match_stage["violation_types"] = violation_type
    
    # Determine date format for grouping
    date_format = {
        "day": "%Y-%m-%d",
        "week": "%G-W%V",
        "month": "%Y-%m",
        "year": "%Y"
    }.get(interval, "%Y-%m")
    
    # Aggregation pipeline
    pipeline = [
        {"$match": match_stage},
        {"$project": {
            "date_str": {"$dateToString": {"format": date_format, "date": "$date_occurred"}},
            "violation_types": 1
        }},
        {"$group": {
            "_id": "$date_str",
            "count": {"$sum": 1},
            "violations": {"$push": "$violation_types"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    timeline_data = list(cases_collection.aggregate(pipeline))
    
    # Format the results
    result = []
    for item in timeline_data:
        # Convert date string back to date object for the response
        date_parts = item["_id"].split("-")
        if len(date_parts) == 2:  # month format
            date_obj = datetime(int(date_parts[0]), int(date_parts[1]), 1).date()
        elif len(date_parts) == 3:  # day format
            date_obj = datetime(int(date_parts[0]), int(date_parts[1]), int(date_parts[2])).date()
        elif "W" in item["_id"]:  # week format
            year, week = item["_id"].split("-W")
            date_obj = datetime.strptime(f"{year}-W{week}-1", "%G-W%V-%u").date()
        else:  # year format
            date_obj = datetime(int(date_parts[0]), 1, 1).date()
        
        timeline_item = TimelineData(
            date=date_obj,
            count=item["count"],
            violation_type=violation_type
        )
        result.append(timeline_item)
    
    return result


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None)
):
    """
    Get comprehensive analytics overview.
    
    This endpoint provides a comprehensive overview of analytics data,
    including counts, trends, and geographical distribution of human rights violations.
    """
    cases_collection = mongodb.get_collection("cases")
    reports_collection = mongodb.get_collection("incident_reports")
    victims_collection = mongodb.get_collection("victims")
    
    # Build match stage for filtering
    match_stage = {}
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_query["$lte"] = datetime.fromisoformat(end_date)
        match_stage["date_occurred"] = date_query
    
    if country:
        match_stage["location.country"] = country
    
    if violation_type:
        match_stage["violation_types"] = violation_type
    
    # Count documents with filters
    total_cases = cases_collection.count_documents(match_stage)
    
    # Adjust match stage for reports
    report_match = {}
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_query["$lte"] = datetime.fromisoformat(end_date)
        report_match["incident_details.date"] = date_query
    
    if country:
        report_match["incident_details.location.country"] = country
    
    if violation_type:
        report_match["incident_details.violation_types"] = violation_type
    
    total_reports = reports_collection.count_documents(report_match)
    
    # Count victims (this is simplified, in a real app you'd need to filter by case involvement)
    total_victims = victims_collection.count_documents({})
    
    # Get violation counts
    violation_counts_pipeline = [
        {"$match": match_stage} if match_stage else {"$match": {}},
        {"$unwind": "$violation_types"},
        {"$group": {
            "_id": "$violation_types",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    violation_counts_data = list(cases_collection.aggregate(violation_counts_pipeline))
    violation_counts = [
        ViolationTypeCount(violation_type=item["_id"], count=item["count"])
        for item in violation_counts_data
    ]
    
    # Create response
    response = AnalyticsResponse(
        total_cases=total_cases,
        total_reports=total_reports,
        total_victims=total_victims,
        violation_counts=violation_counts
    )
    
    return response
