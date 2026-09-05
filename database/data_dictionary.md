# HMS MVP Data Dictionary

This document details the database schema and relationships for the AI Claim Bridge HMS MVP.

## Roles
- `ADMIN`
- `DOCTOR`
- `NURSE`
- `RECEPTIONIST`
- `CLAIM_OFFICER`
- `AUDITOR`

---

## 1. hospitals
The root entity representing the healthcare facility.
- `hospital_id` (UUID, PK)
- `hospital_name` (Text)
- `hfr_id` (Text)
- `rohini_code` (Text)
- `empanelment_type` (Text)
- `district` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 2. departments
Logical groupings within a hospital.
- `department_id` (UUID, PK)
- `hospital_id` (UUID, FK -> hospitals)
- `department_name` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 3. users
Hospital staff with Supabase Auth integration and RBAC.
- `user_id` (UUID, PK, matches Supabase auth.users.id)
- `hospital_id` (UUID, FK -> hospitals)
- `employee_id` (Text, Unique)
- `department_id` (UUID, FK -> departments)
- `name` (Text)
- `email` (Text, Unique)
- `role` (Text, ENUM of roles)
- `status` (Text, e.g., ACTIVE, INACTIVE)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 4. doctors
Specific medical staff details.
- `doctor_id` (UUID, PK, FK -> users)
- `hospital_id` (UUID, FK -> hospitals)
- `specialty` (Text)
- `hpr_id` (Text)
- `nmc_reg_number` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 5. patients
Core patient demographic information.
- `patient_id` (UUID, PK)
- `full_name` (Text)
- `date_of_birth` (Date)
- `gender` (Text)
- `contact_number` (Text)
- `abha_id` (Text, Unique)
- `ration_card_type` (Text)
- `state_domicile` (Text)
- `district` (Text)
- `address` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 6. appointments
Scheduled patient visits.
- `appointment_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `doctor_id` (UUID, FK -> doctors)
- `hospital_id` (UUID, FK -> hospitals)
- `appointment_date` (Date)
- `appointment_time` (Time)
- `reason` (Text)
- `status` (Text, SCHEDULED, CHECKED_IN, COMPLETED, CANCELLED)
- `created_by` (UUID, FK -> users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 7. encounters
Actual medical visits (admissions or OPD).
- `encounter_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `hospital_id` (UUID, FK -> hospitals)
- `doctor_id` (UUID, FK -> doctors)
- `admission_date` (Timestamp)
- `discharge_date` (Timestamp, Nullable)
- `admission_type` (Text)
- `diagnosis` (Text)
- `procedure_name` (Text)
- `procedure_code` (Text)
- `status` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 8. vitals
Patient measurements.
- `vital_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `encounter_id` (UUID, FK -> encounters)
- `recorded_by` (UUID, FK -> users)
- `temperature` (Numeric)
- `heart_rate` (Integer)
- `systolic_bp` (Integer)
- `diastolic_bp` (Integer)
- `spo2` (Integer)
- `respiratory_rate` (Integer)
- `recorded_at` (Timestamp)

## 9. clinical_notes
Notes made by doctors.
- `note_id` (UUID, PK)
- `encounter_id` (UUID, FK -> encounters)
- `provisional_diagnosis` (Text)
- `doctor_note_raw` (Text)
- `created_by` (UUID, FK -> doctors)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 10. nursing_notes
Notes made by nurses.
- `nursing_note_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `encounter_id` (UUID, FK -> encounters)
- `nurse_id` (UUID, FK -> users)
- `note_text` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 11. diagnostic_reports
- `report_id` (UUID, PK)
- `encounter_id` (UUID, FK -> encounters)
- `report_type` (Text)
- `file_status` (Text)
- `file_url` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 12. documents
General uploaded documents.
- `document_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `encounter_id` (UUID, FK -> encounters)
- `document_type` (Text)
- `file_status` (Text)
- `file_url` (Text)
- `uploaded_at` (Timestamp)
- `updated_at` (Timestamp)

## 13. mjpjay_packages
Master list of claim packages.
- `package_code` (Text, PK)
- `specialty` (Text)
- `package_name` (Text)
- `government_rate_inr` (Numeric)
- `mandatory_documents` (JSONB)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 14. claims
- `claim_id` (UUID, PK)
- `encounter_id` (UUID, FK -> encounters)
- `patient_id` (UUID, FK -> patients)
- `hospital_id` (UUID, FK -> hospitals)
- `package_code` (Text, FK -> mjpjay_packages)
- `scheme` (Text)
- `claimed_amount` (Numeric)
- `approved_amount` (Numeric)
- `preauth_status` (Text)
- `submission_timestamp` (Timestamp, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 15. claim_events
Timeline events for a claim.
- `event_id` (UUID, PK)
- `claim_id` (UUID, FK -> claims)
- `event_type` (Text)
- `description` (Text)
- `created_by` (UUID, FK -> users)
- `created_at` (Timestamp)

## 16. consents
- `consent_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `purpose` (Text)
- `status` (Text, PENDING, GRANTED, REVOKED, EXPIRED)
- `granted_at` (Timestamp, Nullable)
- `expires_at` (Timestamp, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 17. eligibility_checks
- `eligibility_id` (UUID, PK)
- `patient_id` (UUID, FK -> patients)
- `encounter_id` (UUID, FK -> encounters)
- `scheme` (Text)
- `checked_at` (Timestamp)
- `eligible` (Boolean)
- `status` (Text)
- `reason` (Text)

## 18. system_audit_logs
- `audit_id` (UUID, PK)
- `user_id` (UUID, FK -> users)
- `hospital_id` (UUID, FK -> hospitals)
- `action` (Text)
- `resource_type` (Text)
- `resource_id` (UUID)
- `ip_address` (Text)
- `timestamp` (Timestamp)
- `metadata` (JSONB)
