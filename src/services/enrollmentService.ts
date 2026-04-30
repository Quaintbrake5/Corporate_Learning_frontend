import api from './api';

export interface EnrollmentResponse {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  start_date: string;
  completion_date?: string;
  deadline_date?: string;
}

export const enrollInCourse = async (courseId: string): Promise<EnrollmentResponse> => {
  const response = await api.post<EnrollmentResponse>(`/courses/${courseId}/enroll`);
  return response.data;
};
