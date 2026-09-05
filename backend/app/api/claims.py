from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.models.models import Claim, ClaimEvent, MjpjayPackage, User, Document, Encounter
from app.schemas.schemas import Claim as ClaimSchema, ClaimCreate, PreflightResponse
from app.core.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/claims", tags=["claims"])

@router.get("", response_model=List[ClaimSchema])
def list_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "CLAIM_OFFICER", "AUDITOR"]))
):
    return db.query(Claim).all()

@router.post("", response_model=ClaimSchema, status_code=status.HTTP_201_CREATED)
def create_claim(
    claim: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "CLAIM_OFFICER"]))
):
    db_claim = Claim(**claim.model_dump())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    # Create Claim Created Event
    event = ClaimEvent(
        claim_id=db_claim.claim_id,
        event_type="CLAIM_CREATED",
        description="Claim was drafted",
        created_by=current_user.user_id
    )
    db.add(event)
    db.commit()
    
    return db_claim

@router.get("/{claim_id}", response_model=ClaimSchema)
def get_claim(
    claim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "CLAIM_OFFICER", "AUDITOR"]))
):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.post("/{claim_id}/preflight", response_model=PreflightResponse)
def run_preflight(
    claim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN", "CLAIM_OFFICER"]))
):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    package = db.query(MjpjayPackage).filter(MjpjayPackage.package_code == claim.package_code).first()
    if not package:
        return PreflightResponse(status="BLOCKED", missing_documents=[], warnings=["Package code not found"])
        
    encounter = db.query(Encounter).filter(Encounter.encounter_id == claim.encounter_id).first()
    
    missing_docs = []
    warnings = []
    
    if package.mandatory_documents:
        # Expected format: list of strings
        required_docs = package.mandatory_documents if isinstance(package.mandatory_documents, list) else []
        
        # Check uploaded docs
        uploaded_docs = db.query(Document).filter(Document.encounter_id == claim.encounter_id).all()
        uploaded_types = [doc.document_type for doc in uploaded_docs]
        
        for req_doc in required_docs:
            if req_doc not in uploaded_types:
                missing_docs.append(req_doc)
                
    if not encounter.discharge_date:
        warnings.append("Patient has not been discharged yet")
        
    status = "BLOCKED" if missing_docs else "PASSED"
    
    # Log event
    event = ClaimEvent(
        claim_id=claim.claim_id,
        event_type="PREFLIGHT_RUN",
        description=f"Preflight {status}. Missing: {len(missing_docs)}",
        created_by=current_user.user_id
    )
    db.add(event)
    
    # Update claim status based on preflight
    if status == "BLOCKED":
        claim.preauth_status = "PREFLIGHT_BLOCKED"
    elif status == "PASSED" and claim.preauth_status in ["DRAFT", "PREFLIGHT_BLOCKED"]:
        claim.preauth_status = "VALIDATING"
        
    db.commit()

    return PreflightResponse(
        status=status,
        missing_documents=missing_docs,
        warnings=warnings
    )
