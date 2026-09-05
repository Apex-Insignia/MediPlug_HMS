from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.models.models import Encounter, User
from app.schemas.schemas import Encounter as EncounterSchema, EncounterCreate
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/encounters", tags=["encounters"])

@router.get("", response_model=List[EncounterSchema])
def list_encounters(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "CLAIM_OFFICER"]))
):
    return db.query(Encounter).all()

@router.post("", response_model=EncounterSchema, status_code=status.HTTP_201_CREATED)
def create_encounter(
    encounter: EncounterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "DOCTOR", "RECEPTIONIST"]))
):
    db_encounter = Encounter(**encounter.model_dump())
    db.add(db_encounter)
    db.commit()
    db.refresh(db_encounter)
    return db_encounter

@router.get("/{encounter_id}", response_model=EncounterSchema)
def get_encounter(
    encounter_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "CLAIM_OFFICER"]))
):
    encounter = db.query(Encounter).filter(Encounter.encounter_id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    return encounter
