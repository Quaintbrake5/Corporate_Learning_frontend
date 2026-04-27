import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import type { Module } from '../../../services/courseService';
import type { AssessmentResponse, AssessmentQuestion as ApiAssessmentQuestion } from '../../../services/adminService';
import { parseErrorMessage } from '../../../utils/errorUtils';
import styles from './AssessmentForm.module.css';

interface AssessmentFormProps {
  module: Module;
  onAssessmentSaved?: () => void;
}

interface AssessmentQuestionForm {
  question_id: string;
  question: string;
  options: string[];
  correct_option: string;
  topic: string;
}

interface FormData {
  questions: AssessmentQuestionForm[];
  passing_score: number;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ module, onAssessmentSaved }) => {
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // AI generation state
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Form state for creating/editing assessment
  const [formData, setFormData] = useState<FormData>({
    questions: [{
      question_id: '',
      question: '',
      options: ['', '', '', ''],
      correct_option: '',
      topic: ''
    }],
    passing_score: 70
  });

  // Load existing assessment for the module
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getAssessmentByModule(module.id);
        setAssessment(data);

        // Populate form with existing data if assessment exists
        if (data.questions && data.questions.length > 0) {
          setFormData({
            questions: data.questions.map((q: ApiAssessmentQuestion) => ({
              question_id: q.question_id || '',
              question: q.question || '',
              options: Array.isArray(q.options) ? q.options : [],
              correct_option: q.correct_option || '',
              topic: q.topic || ''
            })),
            passing_score: data.passing_score || 70
          });
        }
      } catch (err: unknown) {
        // Check if it's a 404 error
        const errorObj = err as { response?: { status?: number; data?: { detail?: string } } };
        const status = errorObj.response?.status;
        const detail = errorObj.response?.data?.detail;

        if (status === 404) {
          // Module not found - this is an error we should show
          if (detail?.includes('Module not found')) {
            setError('Module not found in database. Please refresh the page and try again.');
          }
          // If "No assessment found", that's fine - we'll create one, no error needed
        } else {
          // Any other error
          setError(parseErrorMessage(err, 'Failed to load assessment'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [module.id]);

  // AI Quiz Generation Handler
  const handleGenerateAIQuiz = async () => {
    try {
      setGeneratingAI(true);
      setError(null);

      const result = await adminService.generateAIQuiz(module.id, 5);

      // Populate form with AI-generated questions
      setFormData({
        questions: result.questions.map((q: ApiAssessmentQuestion) => ({
          question_id: '',  // Will be generated on save
          question: q.question,
          options: q.options.length >= 2 ? q.options : ['', '', '', ''],
          correct_option: q.correct_option,
          topic: q.topic || ''
        })),
        passing_score: 70
      });

      setAiGenerated(true);
      setShowForm(true);

      // Parse the response: format is "provider|content_source" (e.g., "openai|youtube_transcript")
      const [provider, contentSource] = result.generated_by.split('|');

      // Build informative message based on provider and content source
      let sourceMessage = '';
      if (contentSource === 'youtube_transcript') {
        sourceMessage = 'analyzed from YouTube video transcript';
      } else if (contentSource === 'video_transcription') {
        sourceMessage = 'analyzed from video audio transcription';
      } else if (contentSource === 'metadata_only') {
        sourceMessage = 'based on course metadata (no transcript available)';
      }

      // Show notification about which provider was used
      if (provider === 'mock') {
        setError(`Using mock questions (${sourceMessage}). Add OPENAI_API_KEY or GEMINI_API_KEY for AI-generated questions with correct answers.`);
      } else if (provider === 'gemini') {
        setError(`Questions generated using Google Gemini (${sourceMessage}). Please review and verify the correct answers before saving.`);
      } else if (provider === 'openai') {
        setError(`Questions generated using OpenAI GPT-4 (${sourceMessage}). Please review and verify the correct answers before saving.`);
      }
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to generate quiz with AI'));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question_id: '',
        question: '',
        options: ['', '', '', ''],
        correct_option: '',
        topic: ''
      }]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleQuestionChange = (questionIndex: number, field: keyof AssessmentQuestionForm, value: string) => {
    setFormData((prev: FormData) => {
      const questions = [...prev.questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value
      };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData((prev: FormData) => {
      const questions = [...prev.questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = value;
      questions[questionIndex].options = options;
      return { ...prev, questions };
    });
  };

  const handleAddOption = (questionIndex: number) => {
    setFormData((prev: FormData) => {
      const questions = [...prev.questions];
      questions[questionIndex].options = [...questions[questionIndex].options, ''];
      return { ...prev, questions };
    });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    if (formData.questions[questionIndex].options.length > 2) {
      setFormData((prev: FormData) => {
        const questions = [...prev.questions];
        const options = [...questions[questionIndex].options];
        options.splice(optionIndex, 1);
        questions[questionIndex].options = options;
        return { ...prev, questions };
      });
    }
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: FormData) => ({
      ...prev,
      passing_score: value === '' ? 0 : Number.parseInt(value) || 0
    }));
  };

  const validateForm = (data: FormData): string | null => {
    if (!data.questions?.length) return 'At least one question is required';
    if (data.passing_score < 0 || data.passing_score > 100) return 'Passing score must be between 0 and 100';

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      const qNum = i + 1;
      if (!q.question.trim()) return `Question ${qNum} is required`;
      if (q.options.some(opt => !opt.trim())) return `All options for question ${qNum} must be filled`;
      if (!q.correct_option) return `Correct answer is required for question ${qNum}`;
      if (!q.options.includes(q.correct_option)) return `Correct answer for question ${qNum} must be one of the options`;
    }
    return null;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const assessmentData = {
        questions: formData.questions.map(q => ({
          question_id: q.question_id || crypto.randomUUID(),
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          topic: q.topic
        })),
        passing_score: formData.passing_score
      };

      if (assessment) {
        await adminService.updateAssessment(assessment.assessment_id, assessmentData);
      } else {
        await adminService.createAssessment(module.id, assessmentData);
      }

      setShowForm(false);
      onAssessmentSaved?.();
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to save assessment'));
    }
  };

  const renderActionButton = () => {
    if (!showForm && !assessment) {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={styles.submitBtn}
            style={{ backgroundColor: '#90ee90', color: '#003366' }}
          >
            Add Assessment
          </button>
          <button
            type="button"
            onClick={handleGenerateAIQuiz}
            disabled={generatingAI}
            className={styles.submitBtn}
            style={{
              backgroundColor: generatingAI ? '#ccc' : '#3b82f6',
              color: 'white',
              opacity: generatingAI ? 0.7 : 1
            }}
          >
            {generatingAI ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      );
    }
    if (!showForm && assessment) {
      return (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={styles.submitBtn}
          style={{ backgroundColor: '#90ee90', color: '#003366' }}
        >
          Edit Assessment
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className={styles.submitBtn}
        style={{ backgroundColor: '#666', color: '#003366' }}
      >
        Cancel
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Assessment for {module.title}</h3>
        {renderActionButton()}
      </div>

      {/* Show error at top if exists */}
      {error && (
        <div style={{
          color: 'red',
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {aiGenerated && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              marginBottom: '1rem',
              color: '#1e40af'
            }}>
              <strong>AI-Generated Questions</strong> - Please review and edit the questions before saving.
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="assessmentFormPassingScore" className={styles.label}>Passing Score (%)</label>
            <input
              id="assessmentFormPassingScore"
              type="number"
              min="0"
              max="100"
              className={styles.input}
              value={formData.passing_score}
              onChange={handlePassingScoreChange}
              required
            />
          </div>

          <div className={styles.questionsContainer}>
            {formData.questions.map((question, qIndex) => (
              <div key={question.question_id || qIndex.toString()} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <h4>Question {qIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className={styles.removeQuestionBtn}
                    disabled={formData.questions.length === 1}
                  >
                    Remove Question
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`question-${qIndex}`} className={styles.label}>Question Text</label>
                  <input
                    id={`question-${qIndex}`}
                    className={styles.input}
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`topic-${qIndex}`} className={styles.label}>Topic (Optional)</label>
                  <input
                    id={`topic-${qIndex}`}
                    className={styles.input}
                    value={question.topic}
                    onChange={(e) => handleQuestionChange(qIndex, 'topic', e.target.value)}
                  />
                </div>

                <div className={styles.optionsContainer}>
                  <div className={styles.optionsHeader}>
                    <h5>Options</h5>
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIndex)}
                      className={styles.addOptionBtn}
                    >
                      Add Option
                    </button>
                  </div>

                  {question.options.map((option, oIndex) => (
                    <div key={`question-option-${qIndex}-${oIndex}`} className={styles.optionRow}>
                      <input
                        type="text"
                        className={styles.optionInput}
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCodePoint(65 + oIndex)}`}
                      />
                      {oIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, oIndex)}
                          className={styles.removeOptionBtn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`correct-${qIndex}`} className={styles.label}>Correct Answer</label>
                  <select
                    id={`correct-${qIndex}`}
                    className={styles.select}
                    value={question.correct_option}
                    onChange={(e) => handleQuestionChange(qIndex, 'correct_option', e.target.value)}
                  >
                    {question.options.map((opt, optIndex) => {
                      return (
                        <option key={`option-${qIndex}-${optIndex}`} value={opt}>
                          {opt} ({String.fromCodePoint(65 + optIndex)})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.formGroup}>
            <button type="button" onClick={handleAddQuestion} className={styles.addQuestionBtn}>
              Add Question
            </button>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn}>Save Assessment</button>
          </div>
        </form>
      )}

      {loading && !showForm && <p>Loading assessment...</p>}

      {!loading && !showForm && assessment && (
        <div className={styles.assessmentInfo}>
          <h4>Existing Assessment</h4>
          <p><strong>Questions:</strong> {assessment.questions.length}</p>
          <p><strong>Passing Score:</strong> {assessment.passing_score}%</p>
          <p><strong>Module:</strong> {module.title}</p>
        </div>
      )}

      {!loading && !showForm && !assessment && !error && (
        <div className={styles.emptyState}>No assessment found for this module. Click "Add Assessment" to create one.</div>
      )}
    </div>
  );
};

export default AssessmentForm;