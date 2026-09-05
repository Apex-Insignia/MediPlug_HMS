from fastapi.testclient import TestClient

def test_rbac_unauthorized_access(client: TestClient, override_role):
    # Set role to RECEPTIONIST
    override_role("RECEPTIONIST")
    
    # Receptionist trying to create a claim (should be forbidden)
    payload = {
        "encounter_id": "00000000-0000-0000-0000-000000000000",
        "patient_id": "00000000-0000-0000-0000-000000000000",
        "hospital_id": "00000000-0000-0000-0000-000000000000",
        "preauth_status": "DRAFT"
    }
    response = client.post("/api/v1/claims", json=payload)
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"]

def test_patient_crud(client: TestClient, override_role):
    override_role("RECEPTIONIST") # Receptionist is allowed to create patients
    
    # Create
    payload = {
        "full_name": "Test Patient",
        "contact_number": "9999999999",
        "abha_id": "DEMO-ABHA-1234"
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test Patient"
    patient_id = data["patient_id"]
    
    # Read
    override_role("DOCTOR")
    response = client.get(f"/api/v1/patients/{patient_id}")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Test Patient"

def test_encounter_creation(client: TestClient, override_role):
    override_role("RECEPTIONIST")
    
    # We need a dummy patient first
    patient_res = client.post("/api/v1/patients", json={
        "full_name": "Encounter Test",
        "contact_number": "11111"
    })
    patient_id = patient_res.json()["patient_id"]
    
    payload = {
        "patient_id": patient_id,
        "hospital_id": "11111111-1111-1111-1111-111111111111",
        "admission_date": "2026-09-01T10:00:00Z",
        "status": "ACTIVE"
    }
    
    response = client.post("/api/v1/encounters", json=payload)
    assert response.status_code == 201
    assert response.json()["patient_id"] == patient_id

def test_claim_preflight_and_creation(client: TestClient, override_role):
    override_role("CLAIM_OFFICER")
    
    # Preflight check on a non-existent claim should return 404
    response = client.post("/api/v1/claims/00000000-0000-0000-0000-000000000000/preflight")
    assert response.status_code == 404

    # Create Claim
    payload = {
        "encounter_id": "00000000-0000-0000-0000-000000000000",
        "patient_id": "00000000-0000-0000-0000-000000000000",
        "hospital_id": "00000000-0000-0000-0000-000000000000",
        "package_code": "PKG-001"
    }
    response = client.post("/api/v1/claims", json=payload)
    assert response.status_code == 201
    claim_id = response.json()["claim_id"]
    
    # Run Preflight
    response = client.post(f"/api/v1/claims/{claim_id}/preflight")
    assert response.status_code == 200
    preflight_data = response.json()
    assert preflight_data["status"] == "BLOCKED" # Since package doesn't exist in DB
