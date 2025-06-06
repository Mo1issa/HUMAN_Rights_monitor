# Human Rights Monitor MIS

A comprehensive Management Information System for human rights monitoring organizations.

## Project Structure

This project is organized into two main components:

- **Backend**: FastAPI application with MongoDB integration
- **Frontend**: React application with Material UI

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install fastapi pymongo uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv
   ```

4. Start the server:
   ```
   python server.py
   ```

The API will be available at http://localhost:8000, and the API documentation at http://localhost:8000/docs.

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000.

## Features

### 1. Case Management System
- Track human rights cases with CRUD operations
- Search and filter functionality
- File attachments for evidence

### 2. Incident Reporting System
- Secure submission of incident reports
- Media attachments
- Anonymous reporting option

### 3. Victim/Witness Database Module
- Securely manage victim/witness data
- Risk assessment
- Protection measures tracking

### 4. Data Analysis & Visualization
- Generate analytics on violations by type
- Geographic distribution of cases
- Timeline analysis

## Development in VS Code

This project is structured for easy development in Visual Studio Code:

1. Open the project folder in VS Code
2. Use the integrated terminal to run backend and frontend servers
3. Install recommended extensions for Python and JavaScript/React development

## API Documentation

The API documentation is available at http://localhost:8000/docs when the backend server is running.
