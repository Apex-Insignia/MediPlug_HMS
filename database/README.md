# AI Claim Bridge - Supabase Database Setup

This package contains the normalized, conflict-free database layer designed specifically around your CSV datasets. No data is lost, and your existing CSVs are used strictly as the source of truth.

## Database Setup Procedure (One-Shot)

Follow these steps exactly in the Supabase SQL Editor and Table Editor to initialize your database without errors.

### Phase 1: Table Creation
Open the Supabase SQL Editor and execute these files **in order**:
1. `001_extensions.sql`
2. `002_schema.sql`
3. `003_indexes.sql`

*(Do **NOT** execute `004_constraints.sql` yet. You must import the CSV data first to avoid foreign key errors).*

### Phase 2: CSV Import Order
Use the Supabase Table Editor to import the CSV files into their matching tables. **You must import them in this exact order** to satisfy data dependencies:

1. `hospital_info.csv` -> `hospitals`
2. `doctors.csv` -> `doctors`
3. `mjpjay_master_packages.csv` -> `mjpjay_packages`
4. `patients (1).csv` -> `staging_patients` *(Crucial: import to staging_patients to preserve the CSV exactly while maintaining privacy in the final tables)*
5. `users.csv` -> `users` *(Newly generated)*
6. `encounters.csv` -> `encounters`
7. `clinical_notes.csv` -> `clinical_notes`
8. `diagnostic_reports.csv` -> `diagnostic_reports`
9. `documents.csv` -> `documents` *(Newly generated)*
10. `consents.csv` -> `consents` *(Newly generated)*
11. `eligibility_checks.csv` -> `eligibility_checks` *(Newly generated)*
12. `claims_preauth.csv` -> `claims`
13. `claim_events.csv` -> `claim_events` *(Newly generated)*
14. `audit_logs.csv` -> `audit_logs`

### Phase 3: Seed & Refine Reference Data
Execute the seed script to prepare data for constraints:
1. `005_seed_reference_data.sql`

**What this script does:**
- Moves data safely from `staging_patients` to `patients`, dropping the `aadhaar_number` column and the staging table.
- Deterministically links `encounters.doctor_id` by matching the `attending_doctor` string with `doctors.doctor_name`.
- Populates missing `hospital_id` and `patient_id` relations for demonstration purposes.

### Phase 4: Add Constraints
Now that all data is fully mapped and seeded, return to the SQL Editor and execute:
1. `004_constraints.sql`

This will enforce strict referential integrity across all tables.

### Phase 5: Supabase Auth Setup (Manual)
To log into the HMS application:
1. Go to Supabase Authentication -> Users.
2. Manually create users matching the emails in `users.csv` (e.g., `admin@sahyadri.local`).
3. Copy the generated User UID from Supabase Auth.
4. Paste it into the `auth_user_id` column for the corresponding row in the `users` table via the Supabase Table Editor.
