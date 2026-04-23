import api from './api';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  department_id: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  verification_sent: boolean;
  message: string;
}

export interface VerifyResponse {
  user_id: string;
  is_verified: boolean;
  message: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    department_id: number;
    role: string;
    is_verified: boolean;
  };
}

export const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', payload);
  return response.data;
};

export const verifyEmail = async (token: string): Promise<VerifyResponse> => {
  const response = await api.post<VerifyResponse>('/auth/verify', { token });
  return response.data;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
