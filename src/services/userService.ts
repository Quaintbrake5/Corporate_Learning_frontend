import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subdivision_id: number;
  role: string;
  is_verified: boolean;
  phone?: string;
}

export interface Subdivision {
  id: number;
  name: string;
  lead_id: string | null;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/users/profile');
  return response.data;
};

export const getSubdivision = async (): Promise<Subdivision> => {
  const response = await api.get<Subdivision>('/users/subdivision');
  return response.data;
};
