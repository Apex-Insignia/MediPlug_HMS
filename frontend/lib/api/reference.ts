import { fetchApi } from './client';

export interface Doctor {
  doctor_id: string;
  doctor_name: string;
  specialty?: string;
  phone_number?: string;
}

export const doctorsApi = {
  getDoctors: (specialty?: string, skip = 0, limit = 100): Promise<Doctor[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (specialty) params.append('specialty', specialty);
    return fetchApi(`/doctors?${params.toString()}`);
  },
  
  getDoctor: (id: string): Promise<Doctor> => {
    return fetchApi(`/doctors/${id}`);
  }
};

export interface Hospital {
  hospital_id: string;
  hospital_name: string;
  hfr_id?: string;
  rohini_code?: string;
  empanelment_type?: string;
  district?: string;
}

export const hospitalsApi = {
  getHospitals: (skip = 0, limit = 100): Promise<Hospital[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    return fetchApi(`/hospitals?${params.toString()}`);
  },
  
  getHospital: (id: string): Promise<Hospital> => {
    return fetchApi(`/hospitals/${id}`);
  }
};

export interface MjpjayPackage {
  package_code: string;
  specialty?: string;
  package_name: string;
  government_rate_inr: number;
  mandatory_documents?: any;
}

export const packagesApi = {
  getPackages: (search?: string, specialty?: string, skip = 0, limit = 100): Promise<MjpjayPackage[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (specialty) params.append('specialty', specialty);
    return fetchApi(`/packages?${params.toString()}`);
  },
  
  getPackage: (id: string): Promise<MjpjayPackage> => {
    return fetchApi(`/packages/${id}`);
  }
};
