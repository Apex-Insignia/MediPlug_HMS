-- 003_indexes.sql

-- Users
CREATE INDEX idx_users_hospital ON users(hospital_id);
CREATE INDEX idx_users_doctor ON users(doctor_id);

-- Encounters
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_hospital ON encounters(hospital_id);
CREATE INDEX idx_encounters_doctor ON encounters(doctor_id);

-- Clinical Notes
CREATE INDEX idx_clinical_notes_encounter ON clinical_notes(encounter_id);

-- Diagnostic Reports
CREATE INDEX idx_diag_reports_encounter ON diagnostic_reports(encounter_id);

-- Documents
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_encounter ON documents(encounter_id);

-- Consents
CREATE INDEX idx_consents_patient ON consents(patient_id);
CREATE INDEX idx_consents_encounter ON consents(encounter_id);

-- Eligibility Checks
CREATE INDEX idx_eligibility_patient ON eligibility_checks(patient_id);
CREATE INDEX idx_eligibility_encounter ON eligibility_checks(encounter_id);

-- Claims
CREATE INDEX idx_claims_encounter ON claims(encounter_id);
CREATE INDEX idx_claims_patient ON claims(patient_id);
CREATE INDEX idx_claims_hospital ON claims(hospital_id);
CREATE INDEX idx_claims_package ON claims(package_code);

-- Claim Events
CREATE INDEX idx_claim_events_claim ON claim_events(claim_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_encounter ON audit_logs(encounter_id);
