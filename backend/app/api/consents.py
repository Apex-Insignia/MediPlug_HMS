import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Consent, Patient
from app.schemas.schemas import Consent as ConsentSchema, ConsentCreate
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(tags=["Consents"])

write_access = RoleChecker(["ADMIN", "CLAIM_OFFICER", "RECEPTIONIST"])

@router.get("/patients/{patient_id}/consents", response_model=List[ConsentSchema], dependencies=[Depends(get_current_user)])
def get_patient_consents(patient_id: str, db: Session = Depends(get_db)):
    return db.query(Consent).filter(Consent.patient_id == patient_id).all()

@router.get("/consents/{consent_id}", response_model=ConsentSchema, dependencies=[Depends(get_current_user)])
def get_consent(consent_id: str, db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.consent_id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent

@router.post("/consents", response_model=ConsentSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(write_access)])
def create_consent(consent_in: ConsentCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == consent_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient_id")
        
    consent = Consent(**consent_in.model_dump())
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent
