import uuid
from sqlalchemy import Column, String, Date, Numeric, Integer, Boolean, ForeignKey, Text, JSON, Time, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP
from app.database.database import Base
from sqlalchemy.sql import func

class Hospital(Base):
    __tablename__ = "hospitals"
    hospital_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_name = Column(String, nullable=False)
    hfr_id = Column(String)
    rohini_code = Column(String)
    empanelment_type = Column(String)
    district = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Department(Base):
    __tablename__ = "departments"
    department_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    department_name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"))
    employee_id = Column(String, unique=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), primary_key=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"))
    specialty = Column(String)
    hpr_id = Column(String)
    nmc_reg_number = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    gender = Column(String)
    contact_number = Column(String)
    abha_id = Column(String, unique=True)
    ration_card_type = Column(String)
    state_domicile = Column(String)
    district = Column(String)
    address = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.doctor_id"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    reason = Column(String)
    status = Column(String, default="SCHEDULED")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Encounter(Base):
    __tablename__ = "encounters"
    encounter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.doctor_id"))
    admission_date = Column(TIMESTAMP(timezone=True), nullable=False)
    discharge_date = Column(TIMESTAMP(timezone=True))
    admission_type = Column(String)
    diagnosis = Column(String)
    procedure_name = Column(String)
    procedure_code = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Vital(Base):
    __tablename__ = "vitals"
    vital_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"))
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    temperature = Column(Numeric)
    heart_rate = Column(Integer)
    systolic_bp = Column(Integer)
    diastolic_bp = Column(Integer)
    spo2 = Column(Integer)
    respiratory_rate = Column(Integer)
    recorded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    note_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"), nullable=False)
    provisional_diagnosis = Column(String)
    doctor_note_raw = Column(String)
    created_by = Column(UUID(as_uuid=True), ForeignKey("doctors.doctor_id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class NursingNote(Base):
    __tablename__ = "nursing_notes"
    nursing_note_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"), nullable=False)
    nurse_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    note_text = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class MjpjayPackage(Base):
    __tablename__ = "mjpjay_packages"
    package_code = Column(String, primary_key=True)
    specialty = Column(String)
    package_name = Column(String, nullable=False)
    government_rate_inr = Column(Numeric, nullable=False)
    mandatory_documents = Column(JSON)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Claim(Base):
    __tablename__ = "claims"
    claim_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    package_code = Column(String, ForeignKey("mjpjay_packages.package_code"))
    scheme = Column(String)
    claimed_amount = Column(Numeric)
    approved_amount = Column(Numeric)
    preauth_status = Column(String, default="DRAFT")
    submission_timestamp = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class ClaimEvent(Base):
    __tablename__ = "claim_events"
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("claims.claim_id"), nullable=False)
    event_type = Column(String, nullable=False)
    description = Column(String)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Document(Base):
    __tablename__ = "documents"
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"))
    document_type = Column(String, nullable=False)
    file_status = Column(String)
    file_url = Column(String)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Consent(Base):
    __tablename__ = "consents"
    consent_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    purpose = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    granted_at = Column(TIMESTAMP(timezone=True))
    expires_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"
    eligibility_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.encounter_id"))
    scheme = Column(String, nullable=False)
    checked_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    eligible = Column(Boolean, nullable=False)
    status = Column(String)
    reason = Column(String)

class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"
    audit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"))
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(UUID(as_uuid=True))
    ip_address = Column(String)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
    metadata_ = Column("metadata", JSON) # 'metadata' is reserved in SQLAlchemy Base
