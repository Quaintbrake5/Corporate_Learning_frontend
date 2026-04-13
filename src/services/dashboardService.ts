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

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/progress/dashboard/stats');
  return response.data;
};
