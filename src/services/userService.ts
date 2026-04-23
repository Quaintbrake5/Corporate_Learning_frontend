import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department_id: number;
  role: string;
  is_verified: boolean;
  phone?: string;
}

export interface Department {
  id: number;
  name: string;
  lead_id: string | null;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/users/profile');
  return response.data;
};

export const getDepartment = async (): Promise<Department> => {
  const response = await api.get<Department>('/users/department');
  return response.data;
};
