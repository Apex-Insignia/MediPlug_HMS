import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import EligibilityCheck, Patient
from app.schemas.schemas import EligibilityCheck as EligibilitySchema, EligibilityCreate
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(tags=["Eligibility"])

write_access = RoleChecker(["ADMIN", "CLAIM_OFFICER", "RECEPTIONIST"])

@router.get("/patients/{patient_id}/eligibility", response_model=List[EligibilitySchema], dependencies=[Depends(get_current_user)])
def get_patient_eligibility(patient_id: str, db: Session = Depends(get_db)):
    return db.query(EligibilityCheck).filter(EligibilityCheck.patient_id == patient_id).all()

@router.get("/eligibility/{eligibility_id}", response_model=EligibilitySchema, dependencies=[Depends(get_current_user)])
def get_eligibility(eligibility_id: str, db: Session = Depends(get_db)):
    check = db.query(EligibilityCheck).filter(EligibilityCheck.eligibility_check_id == eligibility_id).first()
    if not check:
        raise HTTPException(status_code=404, detail="Eligibility check not found")
    return check

@router.post("/eligibility", response_model=EligibilitySchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(write_access)])
def create_eligibility(elig_in: EligibilityCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == elig_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient_id")
        
    check = EligibilityCheck(**elig_in.model_dump())
    db.add(check)
    db.commit()
    db.refresh(check)
    return check
