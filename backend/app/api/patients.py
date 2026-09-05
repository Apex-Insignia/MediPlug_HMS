from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Patient
from app.schemas.schemas import Patient as PatientSchema, PatientCreate
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(tags=["Patients"])

# Everyone except AUDITOR can write patients typically, or maybe just RECEPTIONIST and ADMIN
# For MVP, RECEPTIONIST, ADMIN, NURSE, DOCTOR can create/edit.
write_access = RoleChecker(["ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"])

@router.get("/patients", response_model=List[PatientSchema], dependencies=[Depends(get_current_user)])
def get_patients(search: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Patient)
    if search:
        query = query.filter(Patient.full_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/patients/{patient_id}", response_model=PatientSchema, dependencies=[Depends(get_current_user)])
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/patients", response_model=PatientSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(write_access)])
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.patient_id == patient_in.patient_id).first()
    if db_patient:
        raise HTTPException(status_code=409, detail="Patient ID already registered")
        
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.patch("/patients/{patient_id}", response_model=PatientSchema, dependencies=[Depends(write_access)])
def update_patient(patient_id: str, patient_in: PatientCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    update_data = patient_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
        
    db.commit()
    db.refresh(patient)
    return patient
