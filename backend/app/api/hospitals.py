from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Hospital
from app.schemas.schemas import Hospital as HospitalSchema
from app.core.auth import get_current_user

router = APIRouter(tags=["Hospitals"])

@router.get("/hospitals", response_model=List[HospitalSchema], dependencies=[Depends(get_current_user)])
def get_hospitals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Hospital).offset(skip).limit(limit).all()

@router.get("/hospitals/{hospital_id}", response_model=HospitalSchema, dependencies=[Depends(get_current_user)])
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital
