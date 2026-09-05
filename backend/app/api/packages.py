from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import MjpjayPackage
from app.schemas.schemas import MjpjayPackage as MjpjayPackageSchema
from app.core.auth import get_current_user

router = APIRouter(tags=["Packages"])

@router.get("/packages", response_model=List[MjpjayPackageSchema], dependencies=[Depends(get_current_user)])
def get_packages(specialty: str = None, search: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(MjpjayPackage)
    if specialty:
        query = query.filter(MjpjayPackage.specialty.ilike(f"%{specialty}%"))
    if search:
        query = query.filter(MjpjayPackage.package_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/packages/{package_code}", response_model=MjpjayPackageSchema, dependencies=[Depends(get_current_user)])
def get_package(package_code: str, db: Session = Depends(get_db)):
    package = db.query(MjpjayPackage).filter(MjpjayPackage.package_code == package_code).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package
