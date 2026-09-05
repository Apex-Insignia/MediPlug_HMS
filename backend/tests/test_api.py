from fastapi.testclient import TestClient

def test_rbac_unauthorized_access(client: TestClient, override_role):
    # Set role to RECEPTIONIST
    override_role("RECEPTIONIST")
    
    # Receptionist trying to create a claim (should be forbidden)
    payload = {
        "claim_id": "CLM-999",
        "encounter_id": "ENC-000",
        "package_code": "PKG-000",
        "claimed_amount": 1000.0
    }
    response = client.post("/api/v1/claims", json=payload)
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"]

def test_patient_crud(client: TestClient, override_role):
    override_role("RECEPTIONIST")
    
    # Create
    payload = {
        "patient_id": "PT-TEST-1",
        "full_name": "Test Patient",
        "contact_number": "9999999999"
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test Patient"
    
    # Read
    override_role("DOCTOR")
    response = client.get(f"/api/v1/patients/PT-TEST-1")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Test Patient"

def test_encounter_creation(client: TestClient, override_role):
    override_role("RECEPTIONIST")
    
    # We need a dummy patient first
    patient_res = client.post("/api/v1/patients", json={
        "patient_id": "PT-TEST-2",
        "full_name": "Encounter Test",
        "contact_number": "11111"
    })
    
    payload = {
        "encounter_id": "ENC-TEST-1",
        "patient_id": "PT-TEST-2",
        "status": "ACTIVE"
    }
    
    response = client.post("/api/v1/encounters", json=payload)
    assert response.status_code == 201
    assert response.json()["patient_id"] == "PT-TEST-2"

def test_claim_preflight(client: TestClient, override_role):
    override_role("CLAIM_OFFICER")
    
    # Preflight check on a non-existent claim should return 404
    response = client.post("/api/v1/claims/NON-EXISTENT/preflight")
    assert response.status_code == 404

    # Create Claim
    payload = {
        "claim_id": "CLM-TEST-1",
        "encounter_id": "ENC-TEST-1",
        "package_code": "PKG-001",
        "claimed_amount": 1000.0
    }
    response = client.post("/api/v1/claims", json=payload)
    assert response.status_code == 201
    
    # Run Preflight
    response = client.post(f"/api/v1/claims/CLM-TEST-1/preflight")
    assert response.status_code == 200
    preflight_data = response.json()
    assert preflight_data["status"] == "BLOCKED" # Since package doesn't exist in DB
