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

export const generateQuizForModule = async (moduleId: string): Promise<void> => {
  await api.post(`/modules/${moduleId}/quiz/generate`);
};

export const getQuizForModule = async (moduleId: string): Promise<QuizResponse> => {
  const response = await api.get<QuizResponse>(`/modules/${moduleId}/quiz`);
  return response.data;
};

export const submitQuizForModule = async (
  moduleId: string,
  payload: QuizSubmitRequest
): Promise<QuizSubmitResponse> => {
  const response = await api.post<QuizSubmitResponse>(
    `/modules/${moduleId}/quiz/submit`,
    payload
  );
  return response.data;
};