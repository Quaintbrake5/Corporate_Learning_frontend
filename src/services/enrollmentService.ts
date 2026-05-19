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

export interface EnrollmentStatus {
  course_id: string;
  title: string;
  description?: string;
  duration_in_minutes?: number;
  is_mandatory?: boolean;
  department_owner?: string;
  thumbnail_url?: string;
  enrolled: boolean;
  enrollment_id?: string;
  status?: string;
  progress_percentage?: number;
  start_date?: string;
  completion_date?: string;
  deadline_date?: string;
}

export const enrollInCourse = async (courseId: string): Promise<EnrollmentResponse> => {
  const response = await api.post<EnrollmentResponse>(`/courses/${courseId}/enroll`);
  return response.data;
};

export const getEnrollmentStatus = async (courseId: string): Promise<EnrollmentStatus> => {
  const response = await api.get<EnrollmentStatus>(`/courses/${courseId}/enrollment-status`);
  return response.data;
};
