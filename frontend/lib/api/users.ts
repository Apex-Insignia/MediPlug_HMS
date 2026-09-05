import { fetchApi } from './client';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  hospital_id?: string;
  doctor_id?: string;
  is_active: boolean;
  created_at?: string;
}

export const usersApi = {
  getUsers: (skip = 0, limit = 100): Promise<User[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    return fetchApi(`/users?${params.toString()}`);
  },
  
  getUser: (id: string): Promise<User> => {
    return fetchApi(`/users/${id}`);
  },
  
  updateUserStatus: (id: string, is_active: boolean): Promise<User> => {
    const params = new URLSearchParams({ is_active: is_active.toString() });
    return fetchApi(`/users/${id}/status?${params.toString()}`, {
      method: 'PATCH'
    });
  }
};
