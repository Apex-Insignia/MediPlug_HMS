-- 002_schema.sql

-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'CLAIM_OFFICER',
    'AUDITOR'
);

CREATE TYPE encounter_status AS ENUM (
    'Pre-Auth Pending',
    'Admitted',
    'Discharged'
);

CREATE TYPE admission_type AS ENUM (
    'Emergency',
    'Elective'
);

CREATE TYPE claim_status AS ENUM (
    'Submitted_SHA',
    'Query_Raised',
    'PreFlight_Blocked',
    'Draft',
    'Approved'
);

CREATE TYPE file_status AS ENUM (
    'Uploaded',
    'Pending'
);

CREATE TYPE document_status AS ENUM (
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED'
);

CREATE TYPE consent_status AS ENUM (
    'PENDING',
    'GRANTED',
    'REVOKED',
    'EXPIRED'
);

CREATE TYPE eligibility_status AS ENUM (
    'PENDING',
    'PASSED',
    'FAILED',
    'REQUIRES_REVIEW'
);

-- ==========================================
-- TABLES
-- ==========================================

-- 1. HOSPITALS
CREATE TABLE hospitals (
    hospital_id VARCHAR PRIMARY KEY,
    hospital_name VARCHAR NOT NULL,
    hfr_id VARCHAR,
    rohini_code VARCHAR,
    empanelment_type VARCHAR,
    district VARCHAR
);

-- 2. DOCTORS
CREATE TABLE doctors (
    doctor_id VARCHAR PRIMARY KEY,
    doctor_name VARCHAR NOT NULL,
    specialty VARCHAR,
    hpr_id VARCHAR,
    nmc_reg_number VARCHAR,
    phone_number VARCHAR,
    address TEXT
);

-- 3. USERS
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    auth_user_id UUID UNIQUE, -- Mapped to auth.users.id manually
    hospital_id VARCHAR,
    doctor_id VARCHAR,
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAGING PATIENTS (Raw import target for CSV compatibility)
CREATE TABLE staging_patients (
    patient_id VARCHAR PRIMARY KEY,
    full_name VARCHAR,
    age INTEGER,
    gender VARCHAR,
    contact_number VARCHAR,
    aadhaar_number VARCHAR,
    ration_card_type VARCHAR,
    state_domicile VARCHAR,
    district VARCHAR,
    address TEXT
);

-- 5. PATIENTS (Application canonical table)
CREATE TABLE patients (
    patient_id VARCHAR PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    age INTEGER,
    date_of_birth DATE,
    gender VARCHAR,
    contact_number VARCHAR,
    abha_id VARCHAR, -- Replaces aadhaar_number for privacy
    ration_card_type VARCHAR,
    state_domicile VARCHAR,
    district VARCHAR,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MJPJAY PACKAGES
CREATE TABLE mjpjay_packages (
    package_code VARCHAR PRIMARY KEY,
    specialty VARCHAR,
    package_name VARCHAR NOT NULL,
    government_rate_inr NUMERIC NOT NULL,
    mandatory_documents JSONB
);

-- 7. ENCOUNTERS
CREATE TABLE encounters (
    encounter_id VARCHAR PRIMARY KEY,
    patient_id VARCHAR NOT NULL,
    hospital_id VARCHAR, -- Added for HMS compatibility
    admission_date DATE,
    attending_doctor VARCHAR, -- Retained for CSV string import
    doctor_id VARCHAR, -- Canonical relationship, populated later
    admission_type admission_type,
    status encounter_status
);

-- 8. CLINICAL NOTES
CREATE TABLE clinical_notes (
    note_id VARCHAR PRIMARY KEY,
    encounter_id VARCHAR NOT NULL,
    provisional_diagnosis TEXT,
    doctor_note_raw TEXT
);

-- 9. DIAGNOSTIC REPORTS
CREATE TABLE diagnostic_reports (
    report_id VARCHAR PRIMARY KEY,
    encounter_id VARCHAR NOT NULL,
    report_type VARCHAR,
    file_status file_status,
    file_url TEXT
);

-- 10. DOCUMENTS
CREATE TABLE documents (
    document_id VARCHAR PRIMARY KEY,
    patient_id VARCHAR NOT NULL,
    encounter_id VARCHAR,
    document_type VARCHAR NOT NULL,
    file_url TEXT NOT NULL,
    status document_status DEFAULT 'PENDING_VERIFICATION',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CONSENTS
CREATE TABLE consents (
    consent_id VARCHAR PRIMARY KEY,
    patient_id VARCHAR NOT NULL,
    encounter_id VARCHAR,
    purpose VARCHAR NOT NULL,
    status consent_status DEFAULT 'PENDING',
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ELIGIBILITY CHECKS
CREATE TABLE eligibility_checks (
    eligibility_check_id VARCHAR PRIMARY KEY,
    patient_id VARCHAR NOT NULL,
    encounter_id VARCHAR,
    scheme VARCHAR NOT NULL,
    status eligibility_status DEFAULT 'PENDING',
    checked_at TIMESTAMP WITH TIME ZONE,
    response_reference VARCHAR,
    notes TEXT
);

-- 13. CLAIMS
CREATE TABLE claims (
    claim_id VARCHAR PRIMARY KEY,
    encounter_id VARCHAR NOT NULL,
    patient_id VARCHAR, -- Added for HMS compatibility
    hospital_id VARCHAR, -- Added for HMS compatibility
    package_code VARCHAR NOT NULL,
    preauth_status claim_status DEFAULT 'Draft',
    claimed_amount NUMERIC NOT NULL,
    approved_amount NUMERIC,
    submission_timestamp TIMESTAMP WITH TIME ZONE
);

-- 14. CLAIM EVENTS
CREATE TABLE claim_events (
    event_id VARCHAR PRIMARY KEY,
    claim_id VARCHAR NOT NULL,
    event_type claim_status NOT NULL,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. AUDIT LOGS (AI/FHIR Specific as per CSV)
CREATE TABLE audit_logs (
    log_id VARCHAR PRIMARY KEY,
    encounter_id VARCHAR NOT NULL,
    extracted_raw_text TEXT,
    mapped_package_code VARCHAR,
    ai_confidence_score NUMERIC,
    preflight_check_status VARCHAR,
    fhir_bundle_status VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE
);
