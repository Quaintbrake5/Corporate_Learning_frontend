import api from './api';

export interface OverdueTraining {
  course_id: string;
  title: string;
  deadline_date: string;
}

export interface DashboardStats {
  training_completion_percentage: number;
  learning_hours: number;
  overdue_courses: OverdueTraining[];
}

export interface ProductivityDataPoint {
  date: string;
  learning_hours: number;
  progress_percentage: number;
}

export interface ProductivityData {
  user_id: string;
  data: ProductivityDataPoint[];
  total_days: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/progress/dashboard/stats');
  return response.data;
};

export const getProductivityData = async (days: number = 30): Promise<ProductivityData> => {
  const response = await api.get<ProductivityData>(`/progress/dashboard/productivity?days=${days}`);
  return response.data;
};
