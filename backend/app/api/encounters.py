from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Encounter, Patient, ClinicalNote, DiagnosticReport
from app.schemas.schemas import Encounter as EncounterSchema, EncounterCreate, ClinicalNote as NoteSchema, DiagnosticReport as ReportSchema
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(tags=["Encounters"])

write_access = RoleChecker(["ADMIN", "DOCTOR", "RECEPTIONIST"])
doc_only = RoleChecker(["DOCTOR", "ADMIN"])

@router.get("/encounters", response_model=List[EncounterSchema], dependencies=[Depends(get_current_user)])
def get_encounters(patient_id: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Encounter)
    if patient_id:
        query = query.filter(Encounter.patient_id == patient_id)
    return query.offset(skip).limit(limit).all()

@router.get("/encounters/{encounter_id}", response_model=EncounterSchema, dependencies=[Depends(get_current_user)])
def get_encounter(encounter_id: str, db: Session = Depends(get_db)):
    encounter = db.query(Encounter).filter(Encounter.encounter_id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    return encounter

@router.post("/encounters", response_model=EncounterSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(write_access)])
def create_encounter(encounter_in: EncounterCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == encounter_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient_id")
        
    encounter = Encounter(**encounter_in.model_dump())
    db.add(encounter)
    db.commit()
    db.refresh(encounter)
    return encounter

@router.patch("/encounters/{encounter_id}", response_model=EncounterSchema, dependencies=[Depends(write_access)])
def update_encounter(encounter_id: str, update_data: dict, db: Session = Depends(get_db)):
    encounter = db.query(Encounter).filter(Encounter.encounter_id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
        
    for key, value in update_data.items():
        if hasattr(encounter, key):
            setattr(encounter, key, value)
            
    db.commit()
    db.refresh(encounter)
    return encounter

# Clinical Notes
@router.get("/encounters/{encounter_id}/clinical-notes", response_model=List[NoteSchema], dependencies=[Depends(get_current_user)])
def get_notes(encounter_id: str, db: Session = Depends(get_db)):
    return db.query(ClinicalNote).filter(ClinicalNote.encounter_id == encounter_id).all()

# Diagnostic Reports
@router.get("/encounters/{encounter_id}/diagnostic-reports", response_model=List[ReportSchema], dependencies=[Depends(get_current_user)])
def get_reports(encounter_id: str, db: Session = Depends(get_db)):
    return db.query(DiagnosticReport).filter(DiagnosticReport.encounter_id == encounter_id).all()
