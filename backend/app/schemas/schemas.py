from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    hospital_id: Optional[str] = None
    doctor_id: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    id: str

class User(UserBase):
    id: str
    auth_user_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    full_name: str
    age: Optional[int] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    abha_id: Optional[str] = None
    ration_card_type: Optional[str] = None
    state_domicile: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    patient_id: str

class Patient(PatientBase):
    patient_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class EncounterBase(BaseModel):
    patient_id: str
    hospital_id: Optional[str] = None
    doctor_id: Optional[str] = None
    admission_date: Optional[date] = None
    admission_type: Optional[str] = None
    status: Optional[str] = None
    attending_doctor: Optional[str] = None

class EncounterCreate(EncounterBase):
    encounter_id: str

class Encounter(EncounterBase):
    encounter_id: str
    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    encounter_id: str
    patient_id: Optional[str] = None
    hospital_id: Optional[str] = None
    package_code: str
    claimed_amount: float
    preauth_status: Optional[str] = "Draft"

class ClaimCreate(ClaimBase):
    claim_id: str

class Claim(ClaimBase):
    claim_id: str
    approved_amount: Optional[float] = None
    submission_timestamp: Optional[datetime] = None
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    document_type: str
    file_url: str
    status: Optional[str] = "PENDING_VERIFICATION"

class DocumentCreate(DocumentBase):
    document_id: str

class Document(DocumentBase):
    document_id: str
    uploaded_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class MjpjayPackage(BaseModel):
    package_code: str
    specialty: Optional[str] = None
    package_name: str
    government_rate_inr: float
    mandatory_documents: Optional[Any] = None
    class Config:
        from_attributes = True

class PreflightResponse(BaseModel):
    status: str # 'PASSED', 'BLOCKED'
    missing_documents: List[str] = []
    warnings: List[str] = []
    errors: List[str] = []

class Hospital(BaseModel):
    hospital_id: str
    hospital_name: str
    hfr_id: Optional[str] = None
    rohini_code: Optional[str] = None
    empanelment_type: Optional[str] = None
    district: Optional[str] = None
    class Config:
        from_attributes = True

class Doctor(BaseModel):
    doctor_id: str
    doctor_name: str
    specialty: Optional[str] = None
    phone_number: Optional[str] = None
    class Config:
        from_attributes = True

class ConsentBase(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    purpose: str
    status: Optional[str] = "PENDING"

class ConsentCreate(ConsentBase):
    consent_id: str

class Consent(ConsentBase):
    consent_id: str
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class EligibilityBase(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    scheme: str
    status: Optional[str] = "PENDING"
    notes: Optional[str] = None

class EligibilityCreate(EligibilityBase):
    eligibility_check_id: str

class EligibilityCheck(EligibilityBase):
    eligibility_check_id: str
    checked_at: Optional[datetime] = None
    response_reference: Optional[str] = None
    class Config:
        from_attributes = True
        
class ClaimEvent(BaseModel):
    event_id: str
    claim_id: str
    event_type: str
    description: Optional[str] = None
    timestamp: Optional[datetime] = None
    class Config:
        from_attributes = True

class ClinicalNote(BaseModel):
    note_id: str
    encounter_id: str
    provisional_diagnosis: Optional[str] = None
    doctor_note_raw: Optional[str] = None
    class Config:
        from_attributes = True

class DiagnosticReport(BaseModel):
    report_id: str
    encounter_id: str
    report_type: Optional[str] = None
    file_status: Optional[str] = None
    file_url: Optional[str] = None
    class Config:
        from_attributes = True
