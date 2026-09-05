-- 003_indexes.sql
-- Indexes for performance

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_abha_id ON patients(abha_id);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_hospital ON encounters(hospital_id);
CREATE INDEX idx_encounters_doctor ON encounters(doctor_id);
CREATE INDEX idx_claims_encounter ON claims(encounter_id);
CREATE INDEX idx_claims_patient ON claims(patient_id);
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_encounter ON documents(encounter_id);
CREATE INDEX idx_consents_patient ON consents(patient_id);
CREATE INDEX idx_eligibility_patient ON eligibility_checks(patient_id);
CREATE INDEX idx_audit_logs_user ON system_audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON system_audit_logs(resource_type, resource_id);
