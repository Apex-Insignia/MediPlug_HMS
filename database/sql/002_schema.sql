-- 002_schema.sql
-- Base Tables

CREATE TABLE hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name TEXT NOT NULL,
    hfr_id TEXT,
    rohini_code TEXT,
    empanelment_type TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id),
    department_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Staff) Table with Supabase Auth ID matching
CREATE TABLE users (
    user_id UUID PRIMARY KEY, -- Matches Supabase auth.users.id
    hospital_id UUID REFERENCES hospitals(hospital_id),
    employee_id TEXT UNIQUE,
    department_id UUID REFERENCES departments(department_id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY REFERENCES users(user_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    specialty TEXT,
    hpr_id TEXT,
    nmc_reg_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    contact_number TEXT,
    abha_id TEXT UNIQUE,
    ration_card_type TEXT,
    state_domicile TEXT,
    district TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    doctor_id UUID REFERENCES doctors(doctor_id),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE encounters (
    encounter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id),
    doctor_id UUID REFERENCES doctors(doctor_id),
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    admission_type TEXT,
    diagnosis TEXT,
    procedure_name TEXT,
    procedure_code TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vitals (
    vital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    encounter_id UUID REFERENCES encounters(encounter_id),
    recorded_by UUID REFERENCES users(user_id),
    temperature NUMERIC,
    heart_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    spo2 INTEGER,
    respiratory_rate INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clinical_notes (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(encounter_id),
    provisional_diagnosis TEXT,
    doctor_note_raw TEXT,
    created_by UUID REFERENCES doctors(doctor_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nursing_notes (
    nursing_note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    encounter_id UUID NOT NULL REFERENCES encounters(encounter_id),
    nurse_id UUID REFERENCES users(user_id),
    note_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE diagnostic_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(encounter_id),
    report_type TEXT,
    file_status TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    encounter_id UUID REFERENCES encounters(encounter_id),
    document_type TEXT NOT NULL,
    file_status TEXT,
    file_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mjpjay_packages (
    package_code TEXT PRIMARY KEY,
    specialty TEXT,
    package_name TEXT NOT NULL,
    government_rate_inr NUMERIC NOT NULL,
    mandatory_documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claims (
    claim_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(encounter_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id),
    package_code TEXT REFERENCES mjpjay_packages(package_code),
    scheme TEXT,
    claimed_amount NUMERIC,
    approved_amount NUMERIC,
    preauth_status TEXT DEFAULT 'DRAFT',
    submission_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claim_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES claims(claim_id),
    event_type TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    granted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE eligibility_checks (
    eligibility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    encounter_id UUID REFERENCES encounters(encounter_id),
    scheme TEXT NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    eligible BOOLEAN NOT NULL,
    status TEXT,
    reason TEXT
);

CREATE TABLE system_audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);
