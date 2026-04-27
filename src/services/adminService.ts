import api from './api';
import type { Course, Module } from './courseService';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department_id: number;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminCreateUserData {
  name: string;
  email: string;
  password?: string;
  department_id: number;
  role: 'learner' | 'manager' | 'admin';
}

export interface AdminUpdateUserData {
  password?: string;
  name?: string;
  department_id?: number;
  role?: 'learner' | 'manager' | 'admin';
  is_verified?: boolean;
}

// Departments
export interface Department {
  id: number;
  name: string;
  lead_id: string | null;
}

// Jobs
export interface JobStatus {
  id: string;
  name: string;
  next_run_time: string | null;
  status: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

// Assessment interfaces
export interface AssessmentQuestion {
  question_id: string;
  question: string;
  options: string[];
  correct_option: string;
  topic?: string;
}

export interface AdminCreateAssessmentData {
  questions: AssessmentQuestion[];
  passing_score?: number;
}

export interface AdminUpdateAssessmentData {
  questions?: AssessmentQuestion[];
  passing_score?: number;
}

export interface AssessmentResponse {
  assessment_id: string;
  module_id: string;
  questions: AssessmentQuestion[];
  passing_score: number;
}

const adminService = {
  // Users
  getUsers: async (page = 1, pageSize = 20): Promise<PaginatedUsers> => {
    const response = await api.get('/admin/users', { params: { page, page_size: pageSize } });
    return response.data;
  },

  getUser: async (userId: string): Promise<AdminUser> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (data: AdminCreateUserData): Promise<AdminUser> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (userId: string, data: AdminUpdateUserData): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  updateDepartment: async (departmentId: number, data: { name?: string; lead_id?: string }): Promise<Department> => {
    const response = await api.put(`/admin/departments/${departmentId}`, data);
    return response.data;
  },

  // Courses
  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const response = await api.post('/admin/courses', data);
    return response.data;
  },

  updateCourse: async (courseId: string, data: Partial<Course>): Promise<Course> => {
    const response = await api.put(`/admin/courses/${courseId}`, data);
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/admin/courses/${courseId}`);
  },

  // Modules
  createModule: async (courseId: string, data: Partial<Module>): Promise<Module> => {
    const response = await api.post<Module>(`/admin/courses/${courseId}/modules`, data);
    return response.data;
  },

  updateModule: async (moduleId: string, data: Partial<Module>): Promise<Module> => {
    const response = await api.put<Module>(`/admin/modules/${moduleId}`, data);
    return response.data;
  },

  deleteModule: async (moduleId: string): Promise<void> => {
    await api.delete(`/admin/modules/${moduleId}`);
  },

  // Enrollments
  getEnrollments: async (page = 1, pageSize = 20, userId?: string, courseId?: string): Promise<{ items: Enrollment[]; total: number }> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (userId) params.user_id = userId;
    if (courseId) params.course_id = courseId;
    const response = await api.get('/admin/enrollments', { params });
    return response.data;
  },

  createEnrollment: async (data: { user_id: string; course_id: string }): Promise<Enrollment> => {
    const response = await api.post('/admin/enrollments', data);
    return response.data;
  },

  deleteEnrollment: async (enrollmentId: string): Promise<void> => {
    await api.delete(`/admin/enrollments/${enrollmentId}`);
  },

  // Jobs
  getJobStatus: async (): Promise<JobStatus[]> => {
    const response = await api.get('/admin/jobs/status');
    return response.data;
  },

  // Assessments
  createAssessment: async (moduleId: string, data: AdminCreateAssessmentData): Promise<AssessmentResponse> => {
    const response = await api.post(`/admin/modules/${moduleId}/assessment`, data);
    return response.data;
  },

  updateAssessment: async (assessmentId: string, data: AdminUpdateAssessmentData): Promise<AssessmentResponse> => {
    const response = await api.put(`/admin/assessments/${assessmentId}`, data);
    return response.data;
  },

  deleteAssessment: async (assessmentId: string): Promise<void> => {
    await api.delete(`/admin/assessments/${assessmentId}`);
  },

  getAssessmentByModule: async (moduleId: string): Promise<AssessmentResponse> => {
    const response = await api.get(`/admin/modules/${moduleId}/assessment`);
    return response.data;
  },

  // AI Quiz Generation
  generateAIQuiz: async (moduleId: string, numQuestions: number = 5): Promise<{ questions: AssessmentQuestion[]; generated_by: string }> => {
    const response = await api.post(`/admin/modules/${moduleId}/generate-quiz`, {
      num_questions: numQuestions
    });
    return response.data;
  }
};

export default adminService;
