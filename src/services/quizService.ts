import api from './api';

export interface QuizQuestion {
  question_id: string;
  question: string;
  options: string[];
}

export interface QuizResponse {
  assessment_id: string;
  questions: QuizQuestion[];
  passing_score: number;
}

export interface QuizSubmitRequest {
  answers: {
    question_id: string;
    selected_option: string;
  }[];
  time_spent: number;
}

export interface QuizSubmitResponse {
  assessment_id: string;
  score: number;
  pass_fail: 'pass' | 'fail';
  message: string;
  missed_topics?: string[];
}

export const getQuizForModule = async (moduleId: string): Promise<QuizResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('Fetching quiz for module:', moduleId, 'Token present:', !!token);
    const response = await api.get<QuizResponse>(`/assessments/${moduleId}`);
    console.log('Quiz response:', response.data);
    return response.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: unknown; status?: number; headers?: unknown } };
    console.error('Error in getQuizForModule:', err);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    throw err;
  }
};

export const submitQuizForModule = async (
  moduleId: string,
  payload: QuizSubmitRequest
): Promise<QuizSubmitResponse> => {
  const response = await api.post<QuizSubmitResponse>(
    `/assessments/${moduleId}/submit`,
    payload
  );
  return response.data;
};