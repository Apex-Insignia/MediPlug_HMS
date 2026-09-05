import { fetchApi } from './client';

export interface Encounter {
  encounter_id: string;
  patient_id: string;
  hospital_id?: string;
  admission_date?: string;
  attending_doctor?: string;
  doctor_id?: string;
  admission_type?: string;
  status?: string;
}

export interface ClinicalNote {
  note_id: string;
  encounter_id: string;
  provisional_diagnosis?: string;
  doctor_note_raw?: string;
}

export interface DiagnosticReport {
  report_id: string;
  encounter_id: string;
  report_type?: string;
  file_status?: string;
  file_url?: string;
}

export const encountersApi = {
  getEncounters: (patientId?: string, skip = 0, limit = 100): Promise<Encounter[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (patientId) params.append('patient_id', patientId);
    return fetchApi(`/encounters?${params.toString()}`);
  },
  
  getEncounter: (id: string): Promise<Encounter> => {
    return fetchApi(`/encounters/${id}`);
  },
  
  createEncounter: (data: Partial<Encounter> & { encounter_id: string; patient_id: string }): Promise<Encounter> => {
    return fetchApi('/encounters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateEncounter: (id: string, data: Partial<Encounter>): Promise<Encounter> => {
    return fetchApi(`/encounters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getClinicalNotes: (encounterId: string): Promise<ClinicalNote[]> => {
    return fetchApi(`/encounters/${encounterId}/clinical-notes`);
  },

  getDiagnosticReports: (encounterId: string): Promise<DiagnosticReport[]> => {
    return fetchApi(`/encounters/${encounterId}/diagnostic-reports`);
  }
};
