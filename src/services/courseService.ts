import api from './api';

export interface Course {
  thumbnail_url: string | undefined;
  id: string;
  title: string;
  description: string;
  subdivision_owner: string;
  duration_in_minutes: number;
  is_mandatory: boolean;
  is_cross_subdivision: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content_type: string;
  content_url: string;
  order_index: number;
}

export interface PaginatedCourses {
  items: Course[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const getCourses = async (
  page: number = 1,
  pageSize: number = 10,
  mandatory?: boolean
): Promise<PaginatedCourses> => {
  const params: Record<string, string | number | boolean> = {
    page,
    page_size: pageSize,
  };
  if (mandatory !== undefined) {
    params.mandatory = mandatory;
  }
  const response = await api.get<PaginatedCourses>('/courses', { params });
  return response.data;
};

export const getCourse = async (courseId: string): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${courseId}`);
  return response.data;
};

export const getCourseModules = async (courseId: string): Promise<Module[]> => {
  const response = await api.get<Module[]>(`/courses/${courseId}/modules`);
  return response.data;
};
