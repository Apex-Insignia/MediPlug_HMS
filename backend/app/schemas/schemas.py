from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, time, datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    hospital_id: Optional[UUID] = None
    department_id: Optional[UUID] = None

class UserCreate(UserBase):
    user_id: UUID

class User(UserBase):
    user_id: UUID
    employee_id: Optional[str] = None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    abha_id: Optional[str] = None
    ration_card_type: Optional[str] = None
    state_domicile: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    patient_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class EncounterBase(BaseModel):
    patient_id: UUID
    hospital_id: UUID
    doctor_id: Optional[UUID] = None
    admission_date: datetime
    admission_type: Optional[str] = None
    diagnosis: Optional[str] = None
    procedure_name: Optional[str] = None
    procedure_code: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class EncounterCreate(EncounterBase):
    pass

class Encounter(EncounterBase):
    encounter_id: UUID
    discharge_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    encounter_id: UUID
    patient_id: UUID
    hospital_id: UUID
    package_code: Optional[str] = None
    scheme: Optional[str] = None
    claimed_amount: Optional[float] = None
    preauth_status: str = "DRAFT"

class ClaimCreate(ClaimBase):
    pass

class Claim(ClaimBase):
    claim_id: UUID
    approved_amount: Optional[float] = None
    submission_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    patient_id: UUID
    encounter_id: Optional[UUID] = None
    document_type: str
    file_status: Optional[str] = None
    file_url: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    document_id: UUID
    uploaded_at: datetime
    updated_at: datetime
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
    status: str # 'PASSED', 'BLOCKED', etc.
    missing_documents: List[str]
    warnings: List[str]
