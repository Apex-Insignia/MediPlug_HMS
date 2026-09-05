from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.models.models import Patient, User
from app.schemas.schemas import Patient as PatientSchema, PatientCreate
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("", response_model=List[PatientSchema])
def list_patients(
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "CLAIM_OFFICER"]))
):
    return db.query(Patient).all()

@router.post("", response_model=PatientSchema, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "RECEPTIONIST"]))
):
    # Enforce abha_id uniqueness if provided
    if patient.abha_id:
        existing = db.query(Patient).filter(Patient.abha_id == patient.abha_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="ABHA ID already exists")

    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "CLAIM_OFFICER"]))
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientSchema)
def update_patient(
    patient_id: UUID,
    patient_update: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "RECEPTIONIST"]))
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for key, value in patient_update.model_dump().items():
        setattr(patient, key, value)
    
    db.commit()
    db.refresh(patient)
    return patient
