import { fetchApi } from './client';

export interface Document {
  document_id: string;
  patient_id: string;
  encounter_id?: string;
  document_type: string;
  file_url: string;
  status?: string;
  uploaded_at?: string;
}

export const documentsApi = {
  getEncounterDocuments: (encounterId: string): Promise<Document[]> => {
    return fetchApi(`/encounters/${encounterId}/documents`);
  },
  
  getDocument: (id: string): Promise<Document> => {
    return fetchApi(`/documents/${id}`);
  },
  
  createDocument: (data: Partial<Document> & { document_id: string; patient_id: string; document_type: string; file_url: string }): Promise<Document> => {
    return fetchApi('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export interface Consent {
  consent_id: string;
  patient_id: string;
  encounter_id?: string;
  purpose: string;
  status?: string;
  granted_at?: string;
  revoked_at?: string;
}

export const consentsApi = {
  getPatientConsents: (patientId: string): Promise<Consent[]> => {
    return fetchApi(`/patients/${patientId}/consents`);
  },
  
  getConsent: (id: string): Promise<Consent> => {
    return fetchApi(`/consents/${id}`);
  },
  
  createConsent: (data: Partial<Consent> & { consent_id: string; patient_id: string; purpose: string }): Promise<Consent> => {
    return fetchApi('/consents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export interface EligibilityCheck {
  eligibility_check_id: string;
  patient_id: string;
  encounter_id?: string;
  scheme: string;
  status?: string;
  checked_at?: string;
  response_reference?: string;
  notes?: string;
}

export const eligibilityApi = {
  getPatientEligibility: (patientId: string): Promise<EligibilityCheck[]> => {
    return fetchApi(`/patients/${patientId}/eligibility`);
  },
  
  getEligibility: (id: string): Promise<EligibilityCheck> => {
    return fetchApi(`/eligibility/${id}`);
  },
  
  createEligibility: (data: Partial<EligibilityCheck> & { eligibility_check_id: string; patient_id: string; scheme: string }): Promise<EligibilityCheck> => {
    return fetchApi('/eligibility', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
