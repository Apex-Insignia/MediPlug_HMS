import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Document, Patient, Encounter
from app.schemas.schemas import Document as DocumentSchema, DocumentCreate
from app.core.auth import get_current_user

router = APIRouter(tags=["Documents"])

@router.get("/encounters/{encounter_id}/documents", response_model=List[DocumentSchema], dependencies=[Depends(get_current_user)])
def get_encounter_documents(encounter_id: str, db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.encounter_id == encounter_id).all()

@router.get("/documents/{document_id}", response_model=DocumentSchema, dependencies=[Depends(get_current_user)])
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/documents", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_user)])
def create_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == doc_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient_id")
    
    if doc_in.encounter_id:
        encounter = db.query(Encounter).filter(Encounter.encounter_id == doc_in.encounter_id).first()
        if not encounter:
            raise HTTPException(status_code=400, detail="Invalid encounter_id")
            
    doc = Document(**doc_in.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
