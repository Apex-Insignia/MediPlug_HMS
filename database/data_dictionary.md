# Data Dictionary

## 1. hospitals
*Source: `hospital_info.csv` (Developer Provided)*
- `hospital_id` (VARCHAR) [PK]: Unique identifier.
- `hospital_name` (VARCHAR): Name of the hospital.
- `hfr_id` (VARCHAR): Health Facility Registry ID.
- `rohini_code` (VARCHAR): ROHINI empanelment code.
- `empanelment_type` (VARCHAR): Type of empanelment.
- `district` (VARCHAR): Location.

## 2. doctors
*Source: `doctors.csv` (Developer Provided)*
- `doctor_id` (VARCHAR) [PK]: Unique identifier.
- `doctor_name` (VARCHAR): Full name of the doctor.
- `specialty` (VARCHAR): Clinical specialty.
- `hpr_id` (VARCHAR): Health Professional Registry ID.
- `nmc_reg_number` (VARCHAR): NMC Registration Number.
- `phone_number` (VARCHAR): Contact number.
- `address` (TEXT): Residential/Clinic address.

## 3. users
*Source: `users.csv` (Newly Generated)*
- `id` (VARCHAR) [PK]: Internal user ID.
- `auth_user_id` (UUID): Maps to `auth.users.id` in Supabase Auth.
- `hospital_id` (VARCHAR) [FK -> hospitals]: Associated hospital.
- `doctor_id` (VARCHAR) [FK -> doctors]: Nullable, associates user with a doctor profile.
- `full_name` (VARCHAR): Display name.
- `email` (VARCHAR) [UNIQUE]: Login email.
- `role` (ENUM: `user_role`): Access level (ADMIN, DOCTOR, NURSE, RECEPTIONIST, CLAIM_OFFICER, AUDITOR).
- `is_active` (BOOLEAN): Account status.

## 4. patients
*Source: `patients (1).csv` via `staging_patients` (Developer Provided)*
- `patient_id` (VARCHAR) [PK]: Unique identifier.
- `full_name` (VARCHAR): Full name.
- `age` (INTEGER): Age in years.
- `date_of_birth` (DATE): Nullable optional DOB.
- `gender` (VARCHAR): 'M' or 'F'.
- `contact_number` (VARCHAR): Contact number.
- `abha_id` (VARCHAR): Synthetic/Demo ABHA ID (Aadhaar omitted for privacy).
- `ration_card_type` (VARCHAR): e.g., 'Orange'.
- `state_domicile` (VARCHAR): State.
- `district` (VARCHAR): District.
- `address` (TEXT): Full address.

## 5. mjpjay_packages
*Source: `mjpjay_master_packages.csv` (Developer Provided)*
- `package_code` (VARCHAR) [PK]: Package code (e.g., S1A5.1).
- `specialty` (VARCHAR): Package specialty.
- `package_name` (VARCHAR): Name of the package.
- `government_rate_inr` (NUMERIC): Package cost.
- `mandatory_documents` (JSONB): Array of required document types.

## 6. encounters
*Source: `encounters.csv` (Developer Provided)*
- `encounter_id` (VARCHAR) [PK]: Unique identifier.
- `patient_id` (VARCHAR) [FK -> patients]: Patient ID.
- `hospital_id` (VARCHAR) [FK -> hospitals]: Associated hospital.
- `admission_date` (DATE): Date of admission.
- `attending_doctor` (VARCHAR): Raw name from CSV.
- `doctor_id` (VARCHAR) [FK -> doctors]: Canonical doctor relationship.
- `admission_type` (ENUM: `admission_type`): 'Emergency', 'Elective'.
- `status` (ENUM: `encounter_status`): 'Pre-Auth Pending', 'Admitted', 'Discharged'.

## 7. clinical_notes
*Source: `clinical_notes.csv` (Developer Provided)*
- `note_id` (VARCHAR) [PK]: Unique identifier.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `provisional_diagnosis` (TEXT): Diagnosis text.
- `doctor_note_raw` (TEXT): Raw clinical note.

## 8. diagnostic_reports
*Source: `diagnostic_reports.csv` (Developer Provided)*
- `report_id` (VARCHAR) [PK]: Unique identifier.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `report_type` (VARCHAR): Type of report (e.g., USG_Abdomen).
- `file_status` (ENUM: `file_status`): 'Uploaded', 'Pending'.
- `file_url` (TEXT): URL to the file.

## 9. documents
*Source: `documents.csv` (Newly Generated)*
- `document_id` (VARCHAR) [PK]: Unique identifier.
- `patient_id` (VARCHAR) [FK -> patients]: Patient ID.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `document_type` (VARCHAR): Type of document (e.g., IDENTITY_DOCUMENT).
- `file_url` (TEXT): File location.
- `status` (ENUM: `document_status`): 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'.

## 10. consents
*Source: `consents.csv` (Newly Generated)*
- `consent_id` (VARCHAR) [PK]: Unique identifier.
- `patient_id` (VARCHAR) [FK -> patients]: Patient ID.
- `encounter_id` (VARCHAR) [FK -> encounters]: Nullable Encounter ID.
- `purpose` (VARCHAR): Purpose of consent.
- `status` (ENUM: `consent_status`): 'PENDING', 'GRANTED', 'REVOKED', 'EXPIRED'.

## 11. eligibility_checks
*Source: `eligibility_checks.csv` (Newly Generated)*
- `eligibility_check_id` (VARCHAR) [PK]: Unique identifier.
- `patient_id` (VARCHAR) [FK -> patients]: Patient ID.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `scheme` (VARCHAR): Scheme checked (e.g., MJPJAY).
- `status` (ENUM: `eligibility_status`): 'PENDING', 'PASSED', 'FAILED', 'REQUIRES_REVIEW'.

## 12. claims
*Source: `claims_preauth.csv` (Developer Provided)*
- `claim_id` (VARCHAR) [PK]: Unique identifier.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `patient_id` (VARCHAR) [FK -> patients]: Patient ID.
- `hospital_id` (VARCHAR) [FK -> hospitals]: Hospital ID.
- `package_code` (VARCHAR) [FK -> mjpjay_packages]: Claimed package.
- `preauth_status` (ENUM: `claim_status`): 'Submitted_SHA', 'Query_Raised', 'PreFlight_Blocked', 'Draft', 'Approved'.
- `claimed_amount` (NUMERIC): Amount claimed.
- `approved_amount` (NUMERIC): Amount approved.
- `submission_timestamp` (TIMESTAMP): Submission time.

## 13. claim_events
*Source: `claim_events.csv` (Newly Generated)*
- `event_id` (VARCHAR) [PK]: Unique identifier.
- `claim_id` (VARCHAR) [FK -> claims]: Associated claim.
- `event_type` (ENUM: `claim_status`): State transition.
- `description` (TEXT): Description of event.

## 14. audit_logs
*Source: `audit_logs.csv` (Developer Provided)*
- `log_id` (VARCHAR) [PK]: Unique identifier.
- `encounter_id` (VARCHAR) [FK -> encounters]: Encounter ID.
- `extracted_raw_text` (TEXT): Raw AI extracted text.
- `mapped_package_code` (VARCHAR): AI matched package.
- `ai_confidence_score` (NUMERIC): Model confidence.
- `preflight_check_status` (VARCHAR): Preflight result.
- `fhir_bundle_status` (VARCHAR): FHIR generation result.
- `timestamp` (TIMESTAMP): Log time.
