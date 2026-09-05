import uuid
from sqlalchemy import Column, String, Date, Numeric, Integer, Boolean, ForeignKey, Text, JSON, Time, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP, JSONB
from app.database.database import Base
from sqlalchemy.sql import func

class Hospital(Base):
    __tablename__ = "hospitals"
    hospital_id = Column(String, primary_key=True)
    hospital_name = Column(String, nullable=False)
    hfr_id = Column(String)
    rohini_code = Column(String)
    empanelment_type = Column(String)
    district = Column(String)

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(String, primary_key=True)
    doctor_name = Column(String, nullable=False)
    specialty = Column(String)
    hpr_id = Column(String)
    nmc_reg_number = Column(String)
    phone_number = Column(String)
    address = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    auth_user_id = Column(UUID(as_uuid=True), unique=True)
    hospital_id = Column(String, ForeignKey("hospitals.hospital_id"))
    doctor_id = Column(String, ForeignKey("doctors.doctor_id"))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True)
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    date_of_birth = Column(Date)
    gender = Column(String)
    contact_number = Column(String)
    abha_id = Column(String)
    ration_card_type = Column(String)
    state_domicile = Column(String)
    district = Column(String)
    address = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class MjpjayPackage(Base):
    __tablename__ = "mjpjay_packages"
    package_code = Column(String, primary_key=True)
    specialty = Column(String)
    package_name = Column(String, nullable=False)
    government_rate_inr = Column(Numeric, nullable=False)
    mandatory_documents = Column(JSON) # JSON for testing compat, JSONB in real DB

class Encounter(Base):
    __tablename__ = "encounters"
    encounter_id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    hospital_id = Column(String, ForeignKey("hospitals.hospital_id"))
    admission_date = Column(Date)
    attending_doctor = Column(String)
    doctor_id = Column(String, ForeignKey("doctors.doctor_id"))
    admission_type = Column(String)
    status = Column(String)

class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    note_id = Column(String, primary_key=True)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"), nullable=False)
    provisional_diagnosis = Column(Text)
    doctor_note_raw = Column(Text)

class DiagnosticReport(Base):
    __tablename__ = "diagnostic_reports"
    report_id = Column(String, primary_key=True)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"), nullable=False)
    report_type = Column(String)
    file_status = Column(String)
    file_url = Column(Text)

class Document(Base):
    __tablename__ = "documents"
    document_id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"))
    document_type = Column(String, nullable=False)
    file_url = Column(Text, nullable=False)
    status = Column(String, default="PENDING_VERIFICATION")
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Consent(Base):
    __tablename__ = "consents"
    consent_id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"))
    purpose = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    granted_at = Column(TIMESTAMP(timezone=True))
    revoked_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"
    eligibility_check_id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"))
    scheme = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    checked_at = Column(TIMESTAMP(timezone=True))
    response_reference = Column(String)
    notes = Column(Text)

class Claim(Base):
    __tablename__ = "claims"
    claim_id = Column(String, primary_key=True)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id"))
    hospital_id = Column(String, ForeignKey("hospitals.hospital_id"))
    package_code = Column(String, ForeignKey("mjpjay_packages.package_code"), nullable=False)
    preauth_status = Column(String, default="Draft")
    claimed_amount = Column(Numeric, nullable=False)
    approved_amount = Column(Numeric)
    submission_timestamp = Column(TIMESTAMP(timezone=True))

class ClaimEvent(Base):
    __tablename__ = "claim_events"
    event_id = Column(String, primary_key=True)
    claim_id = Column(String, ForeignKey("claims.claim_id"), nullable=False)
    event_type = Column(String, nullable=False)
    description = Column(Text)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    log_id = Column(String, primary_key=True)
    encounter_id = Column(String, ForeignKey("encounters.encounter_id"), nullable=False)
    extracted_raw_text = Column(Text)
    mapped_package_code = Column(String)
    ai_confidence_score = Column(Numeric)
    preflight_check_status = Column(String)
    fhir_bundle_status = Column(String)
    timestamp = Column(TIMESTAMP(timezone=True))
