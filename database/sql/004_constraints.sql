-- 004_constraints.sql

-- USERS
ALTER TABLE users ADD CONSTRAINT fk_users_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id);
ALTER TABLE users ADD CONSTRAINT fk_users_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id);

-- ENCOUNTERS
ALTER TABLE encounters ADD CONSTRAINT fk_encounters_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE encounters ADD CONSTRAINT fk_encounters_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id);
ALTER TABLE encounters ADD CONSTRAINT fk_encounters_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id);

-- CLINICAL NOTES
ALTER TABLE clinical_notes ADD CONSTRAINT fk_notes_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

-- DIAGNOSTIC REPORTS
ALTER TABLE diagnostic_reports ADD CONSTRAINT fk_reports_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

-- DOCUMENTS
ALTER TABLE documents ADD CONSTRAINT fk_docs_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE documents ADD CONSTRAINT fk_docs_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

-- CONSENTS
ALTER TABLE consents ADD CONSTRAINT fk_consents_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE consents ADD CONSTRAINT fk_consents_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

-- ELIGIBILITY CHECKS
ALTER TABLE eligibility_checks ADD CONSTRAINT fk_eligibility_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE eligibility_checks ADD CONSTRAINT fk_eligibility_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

-- CLAIMS
ALTER TABLE claims ADD CONSTRAINT fk_claims_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);
ALTER TABLE claims ADD CONSTRAINT fk_claims_package FOREIGN KEY (package_code) REFERENCES mjpjay_packages(package_code);
ALTER TABLE claims ADD CONSTRAINT fk_claims_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE claims ADD CONSTRAINT fk_claims_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id);

-- CLAIM EVENTS
ALTER TABLE claim_events ADD CONSTRAINT fk_events_claim FOREIGN KEY (claim_id) REFERENCES claims(claim_id);

-- AUDIT LOGS
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);
