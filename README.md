# AI Claim Bridge - Hospital Management System (HMS)

This repository contains the MVP for the AI Claim Bridge Hospital Management System (HMS).
The system is designed with a **Next.js (App Router)** frontend and a **Python FastAPI** backend using **PostgreSQL** (via Supabase).

## Project Structure
- `frontend/`: Next.js web application.
- `backend/`: FastAPI Python application.
- `database/sql/`: SQL schema files to initialize the database.
- `database/csv/`: Directory for placing initial seed CSV datasets.
- `database/data_dictionary.md`: Detailed schema and relationship documentation.

## Running the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate the virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and configure your Supabase `DATABASE_URL` and `JWT_SECRET`.
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. Access Swagger API documentation at: http://localhost:8000/docs

### Running Backend Tests
```bash
PYTHONPATH=. pytest tests/
```

## Running the Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your `NEXT_PUBLIC_SUPABASE_URL` and Anon Key.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Access the application at: http://localhost:3000

## Database Initialization
**Do not execute SQL automatically.**
Please follow the manual initialization instructions detailed in `database/sql/README.md`.
Place your provided CSV datasets into `database/csv/` for manual import into Supabase.

## Features Implemented
- Complete normalized PostgreSQL Schema (`002_schema.sql`).
- Synchronous SQLAlchemy ORM implementation.
- Supabase JWT Authentication & Role-Based Access Control (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `CLAIM_OFFICER`, `AUDITOR`).
- FastAPI REST Endpoints (Patients, Encounters, Claims, Preflight Logic).
- Next.js UI Foundation with dynamic Role-Based Sidebar and Tailwind CSS/Lucide Icons.
