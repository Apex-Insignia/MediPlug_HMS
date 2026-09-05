from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Doctor
from app.schemas.schemas import Doctor as DoctorSchema
from app.core.auth import get_current_user

router = APIRouter(tags=["Doctors"])

@router.get("/doctors", response_model=List[DoctorSchema], dependencies=[Depends(get_current_user)])
def get_doctors(specialty: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Doctor)
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/doctors/{doctor_id}", response_model=DoctorSchema, dependencies=[Depends(get_current_user)])
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
