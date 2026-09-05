-- 004_constraints.sql
-- Check constraints

ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'CLAIM_OFFICER', 'AUDITOR'));
ALTER TABLE users ADD CONSTRAINT check_user_status CHECK (status IN ('ACTIVE', 'INACTIVE'));
ALTER TABLE appointments ADD CONSTRAINT check_appointment_status CHECK (status IN ('SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'));
ALTER TABLE consents ADD CONSTRAINT check_consent_status CHECK (status IN ('PENDING', 'GRANTED', 'REVOKED', 'EXPIRED'));
ALTER TABLE claims ADD CONSTRAINT check_claim_status CHECK (preauth_status IN ('DRAFT', 'VALIDATING', 'PREFLIGHT_BLOCKED', 'SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED', 'QUERY_RAISED', 'FAILED'));
