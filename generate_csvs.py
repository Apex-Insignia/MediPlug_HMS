import csv
import random
from datetime import datetime, timedelta

def read_csv(filename, col_idx):
    res = []
    with open(filename, 'r') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if row: res.append(row[col_idx])
    return res

patients = read_csv('database/csv/patients (1).csv', 0)
encounters = read_csv('database/csv/encounters.csv', 0)
claims = read_csv('database/csv/claims_preauth.csv', 0)
doctors = read_csv('database/csv/doctors.csv', 0)
hospitals = read_csv('database/csv/hospital_info.csv', 0)

hospital_id = hospitals[0] if hospitals else 'HOSP-PUNE-012'

# 1. Generate users.csv (approx 25 rows)
with open('database/csv/users.csv', 'w') as f:
    f.write('id,auth_user_id,hospital_id,doctor_id,full_name,email,role,is_active,created_at,updated_at\n')
    # Specific ones requested
    f.write(f'USR-101,,{hospital_id},,Sarfraz,admin@gmail.com,ADMIN,TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')
    f.write(f'USR-102,,{hospital_id},{doctors[0]},Kabir,kabir@gmail.com,DOCTOR,TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')
    f.write(f'USR-103,,{hospital_id},,Khushi,khushi@gmail.com,NURSE,TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')
    f.write(f'USR-104,,{hospital_id},,Shubh,shubh@gmail.com,RECEPTIONIST,TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')
    f.write(f'USR-105,,{hospital_id},,Ujjwal,ujjwal@gmail.com,CLAIM_OFFICER,TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')
    
    # Generate rest
    roles = ['NURSE', 'RECEPTIONIST', 'CLAIM_OFFICER', 'AUDITOR']
    for i in range(106, 131): # 25 more
        role = random.choice(roles)
        f.write(f'USR-{i},,{hospital_id},,Staff_{i},staff{i}@sahyadri.local,{role},TRUE,2026-08-01T08:00:00Z,2026-08-01T08:00:00Z\n')

# 2. Generate documents.csv (30 rows)
with open('database/csv/documents.csv', 'w') as f:
    f.write('document_id,patient_id,encounter_id,document_type,file_url,status,uploaded_at\n')
    doc_types = ['IDENTITY_DOCUMENT', 'BILL', 'PRESCRIPTION', 'PRE_OP_PHOTO']
    for i in range(1, 31):
        enc = random.choice(encounters)
        pat = patients[encounters.index(enc)] # naive mapping, assume index match roughly or just random
        # Wait, encounters has patient_id! Let's get proper patient_id for encounter
        # Need to read full encounters
        pass

# Better approach for proper mapping
def get_encounter_mapping():
    mapping = {}
    with open('database/csv/encounters.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if row: mapping[row[0]] = row[1] # encounter_id -> patient_id
    return mapping

enc_to_pat = get_encounter_mapping()
doc_types = ['IDENTITY_DOCUMENT', 'BILL', 'PRESCRIPTION', 'PRE_OP_PHOTO']
doc_statuses = ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']
with open('database/csv/documents.csv', 'w') as f:
    f.write('document_id,patient_id,encounter_id,document_type,file_url,status,uploaded_at\n')
    for i in range(1, 31):
        enc = random.choice(encounters)
        pat = enc_to_pat.get(enc, patients[0])
        dtype = random.choice(doc_types)
        dstat = random.choice(doc_statuses)
        f.write(f'DOCU-{2000+i},{pat},{enc},{dtype},https://mock-hms.local/docs/file_{i}.pdf,{dstat},2026-08-25T09:10:00Z\n')

# 3. Generate consents.csv (30 rows)
with open('database/csv/consents.csv', 'w') as f:
    f.write('consent_id,patient_id,encounter_id,purpose,status,granted_at,revoked_at,created_at,updated_at\n')
    for i in range(1, 31):
        enc = random.choice(encounters)
        pat = enc_to_pat.get(enc, patients[0])
        stat = random.choice(['GRANTED', 'PENDING'])
        granted = '2026-08-25T09:15:00Z' if stat == 'GRANTED' else ''
        f.write(f'CONS-{3000+i},{pat},{enc},MJPJAY_CLAIM_PROCESSING,{stat},{granted},,2026-08-25T09:15:00Z,2026-08-25T09:15:00Z\n')

# 4. Generate eligibility_checks.csv (30 rows)
with open('database/csv/eligibility_checks.csv', 'w') as f:
    f.write('eligibility_check_id,patient_id,encounter_id,scheme,status,checked_at,response_reference,notes\n')
    for i in range(1, 31):
        enc = random.choice(encounters)
        pat = enc_to_pat.get(enc, patients[0])
        stat = random.choice(['PASSED', 'FAILED', 'PENDING'])
        f.write(f'ELIG-{4000+i},{pat},{enc},MJPJAY,{stat},2026-08-25T09:20:00Z,MJP-REF-{889000+i},Verified status.\n')

# 5. Generate claim_events.csv (30 rows)
with open('database/csv/claim_events.csv', 'w') as f:
    f.write('event_id,claim_id,event_type,description,timestamp\n')
    for i in range(1, 31):
        clm = random.choice(claims)
        etype = random.choice(['Draft', 'Submitted_SHA', 'Approved', 'Query_Raised'])
        f.write(f'EVT-{5000+i},{clm},{etype},Claim event logged.,2026-08-25T10:00:00Z\n')

