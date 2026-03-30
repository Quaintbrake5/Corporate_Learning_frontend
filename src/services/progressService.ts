import api from './api';

export interface HeartbeatPayload {
  course_id: string;
  module_id: string;
  progress_percentage: number;
  session_id: string;
}

export interface ProgressData {
  user_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  start_date: string | null;
  completion_date: string | null;
  deadline_date: string | null;
}

export const sendHeartbeat = async (payload: HeartbeatPayload) => {
  const response = await api.post('/analytics/heartbeat', payload);
  return response.data;
};

export const getProgress = async (userId: string, courseId: string): Promise<ProgressData> => {
  const response = await api.get<ProgressData>(`/progress/${userId}/${courseId}`);
  return response.data;
};

export const getAnalytics = async (userId: string) => {
  const response = await api.get(`/analytics/${userId}`);
  return response.data;
};
