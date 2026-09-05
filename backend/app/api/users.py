from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import User, Hospital, Doctor
from app.schemas.schemas import User as UserSchema, UserCreate, Hospital as HospitalSchema, Doctor as DoctorSchema
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(tags=["Users"])

admin_only = RoleChecker(["ADMIN"])

@router.get("/users", response_model=List[UserSchema], dependencies=[Depends(admin_only)])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/users/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserSchema, dependencies=[Depends(admin_only)])
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/users/{user_id}/status", response_model=UserSchema, dependencies=[Depends(admin_only)])
def update_user_status(user_id: str, is_active: bool, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
