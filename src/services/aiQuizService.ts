import api from './api';

export interface QuizGenerationRequest {
  contentType: 'video' | 'pdf' | 'scorm';
  contentUrl?: string;
  contentData?: any; // For SCORM or other complex data
  moduleId: string;
  courseId: string;
}

export interface QuizGenerationResponse {
  assessment_id: string;
  questions: Array<{
    question_id: string;
    question: string;
    options: string[];
  }>;
  passing_score: number;
}

export const generateQuizFromContent = async (
  request: QuizGenerationRequest
): Promise<QuizGenerationResponse> => {
  try {
    const response = await api.post<QuizGenerationResponse>(
      '/ai/generate-quiz',
      request
    );
    return response.data;
  } catch (err) {
    console.error('Error generating quiz from content:', err);
    throw err;
  }
};

export const extractTextFromPDF = async (
  pdfUrl: string
): Promise<string> => {
  try {
    const response = await api.post<string>(
      '/ai/extract-text-from-pdf',
      { url: pdfUrl }
    );
    return response.data;
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    throw err;
  }
};

export const processSCORMPackage = async (
  scormData: any
): Promise<{ textContent: string; metadata: any }> => {
  try {
    const response = await api.post<{ textContent: string; metadata: any }>(
      '/ai/process-scorm',
      scormData
    );
    return response.data;
  } catch (err) {
    console.error('Error processing SCORM package:', err);
    throw err;
  }
};