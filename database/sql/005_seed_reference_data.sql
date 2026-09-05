-- 005_seed_reference_data.sql
-- Run this AFTER all CSV files have been imported.

-- 1. Transfer Patient Data from Staging Table
INSERT INTO patients (
    patient_id, 
    full_name, 
    age, 
    gender, 
    contact_number, 
    abha_id, -- Maps to NULL or a synthetic ID if desired, replacing Aadhaar
    ration_card_type, 
    state_domicile, 
    district, 
    address
)
SELECT 
    patient_id, 
    full_name, 
    age, 
    gender, 
    contact_number, 
    NULL, -- Leave ABHA ID null for now
    ration_card_type, 
    state_domicile, 
    district, 
    address
FROM staging_patients;

-- Drop staging table to secure PII (Aadhaar number)
DROP TABLE staging_patients;

-- 2. Establish Canonical Doctor Relationships in Encounters
-- Deterministic matching: Attending Doctor Name -> Doctor ID
UPDATE encounters 
SET doctor_id = doctors.doctor_id 
FROM doctors 
WHERE encounters.attending_doctor = doctors.doctor_name;

-- 3. Populate missing Foreign Keys in Encounters
-- (Since there's only one hospital, we assign it for demo purposes)
UPDATE encounters
SET hospital_id = 'HOSP-PUNE-012'
WHERE hospital_id IS NULL;

-- 4. Populate missing Foreign Keys in Claims
UPDATE claims
SET hospital_id = 'HOSP-PUNE-012'
WHERE hospital_id IS NULL;

UPDATE claims
SET patient_id = (SELECT patient_id FROM encounters WHERE encounters.encounter_id = claims.encounter_id LIMIT 1)
WHERE patient_id IS NULL;
