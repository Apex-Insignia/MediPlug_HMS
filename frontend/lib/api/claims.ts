import { fetchApi } from './client';

export interface Claim {
  claim_id: string;
  encounter_id: string;
  patient_id?: string;
  hospital_id?: string;
  package_code: string;
  preauth_status?: string;
  claimed_amount: number;
  approved_amount?: number;
  submission_timestamp?: string;
}

export interface ClaimEvent {
  event_id: string;
  claim_id: string;
  event_type: string;
  description?: string;
  timestamp?: string;
}

export interface PreflightResponse {
  status: string;
  missing_documents: string[];
  warnings: string[];
  errors: string[];
}

export const claimsApi = {
  getClaims: (skip = 0, limit = 100): Promise<Claim[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    return fetchApi(`/claims?${params.toString()}`);
  },
  
  getClaim: (id: string): Promise<Claim> => {
    return fetchApi(`/claims/${id}`);
  },
  
  createClaim: (data: Partial<Claim> & { claim_id: string; encounter_id: string; package_code: string; claimed_amount: number }): Promise<Claim> => {
    return fetchApi('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateClaim: (id: string, data: Partial<Claim>): Promise<Claim> => {
    return fetchApi(`/claims/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getTimeline: (id: string): Promise<ClaimEvent[]> => {
    return fetchApi(`/claims/${id}/timeline`);
  },

  runPreflight: (id: string): Promise<PreflightResponse> => {
    return fetchApi(`/claims/${id}/preflight`, {
      method: 'POST',
    });
  }
};
