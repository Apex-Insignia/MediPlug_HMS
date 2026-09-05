import { fetchApi } from './client';

export interface Patient {
  patient_id: string;
  full_name: string;
  age?: number;
  date_of_birth?: string;
  gender?: string;
  contact_number?: string;
  abha_id?: string;
  ration_card_type?: string;
  state_domicile?: string;
  district?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export const patientsApi = {
  getPatients: (search?: string, skip = 0, limit = 100): Promise<Patient[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return fetchApi(`/patients?${params.toString()}`);
  },
  
  getPatient: (id: string): Promise<Patient> => {
    return fetchApi(`/patients/${id}`);
  },
  
  createPatient: (data: Partial<Patient> & { patient_id: string; full_name: string }): Promise<Patient> => {
    return fetchApi('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updatePatient: (id: string, data: Partial<Patient>): Promise<Patient> => {
    return fetchApi(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};
