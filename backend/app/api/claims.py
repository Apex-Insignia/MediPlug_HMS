from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Claim, Encounter, Patient, MjpjayPackage, Document, ClaimEvent
from app.schemas.schemas import Claim as ClaimSchema, ClaimCreate, PreflightResponse, ClaimEvent as ClaimEventSchema
from app.core.auth import get_current_user, RoleChecker
import uuid
import json

router = APIRouter(tags=["Claims"])

claim_officer = RoleChecker(["ADMIN", "CLAIM_OFFICER"])

@router.get("/claims", response_model=List[ClaimSchema], dependencies=[Depends(get_current_user)])
def get_claims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Claim).offset(skip).limit(limit).all()

@router.get("/claims/{claim_id}", response_model=ClaimSchema, dependencies=[Depends(get_current_user)])
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.post("/claims", response_model=ClaimSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(claim_officer)])
def create_claim(claim_in: ClaimCreate, db: Session = Depends(get_db)):
    encounter = db.query(Encounter).filter(Encounter.encounter_id == claim_in.encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=400, detail="Invalid encounter_id")
        
    claim = Claim(**claim_in.model_dump())
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # Log event
    event = ClaimEvent(
        event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
        claim_id=claim.claim_id,
        event_type="Draft",
        description="Claim manually created."
    )
    db.add(event)
    db.commit()
    
    return claim

@router.patch("/claims/{claim_id}", response_model=ClaimSchema, dependencies=[Depends(claim_officer)])
def update_claim(claim_id: str, update_data: dict, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    for key, value in update_data.items():
        if hasattr(claim, key):
            setattr(claim, key, value)
            
    db.commit()
    db.refresh(claim)
    return claim

@router.get("/claims/{claim_id}/timeline", response_model=List[ClaimEventSchema], dependencies=[Depends(get_current_user)])
def get_claim_timeline(claim_id: str, db: Session = Depends(get_db)):
    return db.query(ClaimEvent).filter(ClaimEvent.claim_id == claim_id).order_by(ClaimEvent.timestamp.asc()).all()

@router.post("/claims/{claim_id}/preflight", response_model=PreflightResponse, dependencies=[Depends(claim_officer)])
def preflight_check(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    errors = []
    warnings = []
    missing_docs = []
    
    encounter = db.query(Encounter).filter(Encounter.encounter_id == claim.encounter_id).first()
    if not encounter:
        errors.append("Associated encounter not found.")
        
    patient = db.query(Patient).filter(Patient.patient_id == claim.patient_id).first()
    if not patient:
        errors.append("Associated patient not found.")
        
    package = db.query(MjpjayPackage).filter(MjpjayPackage.package_code == claim.package_code).first()
    if not package:
        errors.append("MJPJAY Package not found.")
    else:
        # Check mandatory documents
        mand_docs = []
        if package.mandatory_documents:
            if isinstance(package.mandatory_documents, str):
                mand_docs = json.loads(package.mandatory_documents)
            else:
                mand_docs = package.mandatory_documents
                
        # Get uploaded docs
        uploaded_docs = db.query(Document).filter(Document.encounter_id == claim.encounter_id).all()
        uploaded_types = [d.document_type for d in uploaded_docs]
        
        for required in mand_docs:
            if required not in uploaded_types:
                missing_docs.append(required)
                errors.append(f"Mandatory document missing: {required}")
                
        # Check claim amount
        if claim.claimed_amount and package.government_rate_inr:
            if claim.claimed_amount > package.government_rate_inr:
                warnings.append("Claimed amount exceeds government package rate.")
                
    status_val = "BLOCKED" if len(errors) > 0 else "PASSED"
    
    return PreflightResponse(
        status=status_val,
        missing_documents=missing_docs,
        warnings=warnings,
        errors=errors
    )
