import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Create a directory for file uploads if it doesn't exist
os.makedirs("/home/ubuntu/human_rights_monitor/uploads", exist_ok=True)

# Import the main FastAPI application
from app.main import app

# Mount static files directory for uploads
app.mount("/uploads", StaticFiles(directory="/home/ubuntu/human_rights_monitor/uploads"), name="uploads")

# Add file upload endpoint
@app.post("/api/v1/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file (evidence, documents, etc.) to the server.
    
    This endpoint allows users to upload files that can be attached to cases,
    reports, or other records in the system.
    """
    try:
        file_location = f"/home/ubuntu/human_rights_monitor/uploads/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        
        # Return the URL path to access the file
        return {"filename": file.filename, "url": f"/uploads/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
