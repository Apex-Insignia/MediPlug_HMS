# CSV Seed Data

Place all your existing datasets here:
1. `doctors.csv`
2. `hospital_info.csv`
3. `audit_logs.csv`
4. `claims_preauth.csv`
5. `diagnostic_reports.csv`
6. `mjpjay_master_packages.csv`
7. `patients.csv` (Ensure `aadhaar_number` is mapped to `abha_id` before import)
8. `clinical_notes.csv`
9. `encounters.csv`

The system schema has been designed to normalize and preserve the relationships within these datasets.

## Additional CSVs required (if missing):
- `departments.csv`
- `users.csv` (Note: users must be created in Supabase Auth first, and the `user_id` should match)
- `appointments.csv`
- `vitals.csv`
- `nursing_notes.csv`
- `documents.csv`
- `claim_events.csv`
- `consents.csv`
- `eligibility_checks.csv`
- `system_audit_logs.csv`

Import these into the Supabase project after executing the SQL schema.
