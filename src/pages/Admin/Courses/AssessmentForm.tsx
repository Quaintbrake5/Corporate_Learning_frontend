import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import type { Module } from '../../../services/courseService';
import type { AssessmentResponse, AssessmentQuestion as ApiAssessmentQuestion } from '../../../services/adminService';
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
             // If no assessment exists, that's fine - we'll create one
             if (err instanceof Object && err !== null && 'response' in err && 
                 err.response instanceof Object && err.response !== null && 
                 'status' in err.response && err.response.status !== 404) {
               setError('Failed to load assessment');
             }
          } finally {
            setLoading(false);
          }
     };

     loadAssessment();
   }, [module.id]);

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
     setFormData((prev: FormData) => ({
       ...prev,
       passing_score: Number.parseInt(e.target.value) || 0
     }));
   };

   const validateForm = (data: FormData): string | null => {
     if (!data.questions || data.questions.length === 0) {
       return 'At least one question is required';
     }
 
     for (let i = 0; i < data.questions.length; i++) {
       const q = data.questions[i];
       if (!q.question.trim()) {
         return `Question ${i + 1} is required`;
       }
       if (q.options.some(opt => !opt.trim())) {
         return `All options for question ${i + 1} must be filled`;
       }
       if (!q.correct_option) {
         return `Correct answer is required for question ${i + 1}`;
       }
       if (!q.options.includes(q.correct_option)) {
         return `Correct answer for question ${i + 1} must be one of the options`;
       }
     }
 
     if (data.passing_score < 0 || data.passing_score > 100) {
       return 'Passing score must be between 0 and 100';
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
         // Update existing assessment
         await adminService.updateAssessment(assessment.assessment_id, {
           questions: assessmentData.questions,
           passing_score: assessmentData.passing_score
         });
       } else {
         // Create new assessment
         await adminService.createAssessment(module.id, assessmentData);
       }
 
       setShowForm(false);
       if (onAssessmentSaved) {
         onAssessmentSaved();
       }
 } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
       if (error.response?.data?.detail) {
         setError(error.response.data.detail);
       } else {
         setError('Failed to save assessment');
       }
 }
  };

  const renderActionButton = () => {
    if (!showForm && !assessment) {
      return (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={styles.submitBtn}
          style={{ backgroundColor: '#90ee90', color: '#003366' }}
        >
          Add Assessment
        </button>
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

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
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

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading && !showForm && <p>Loading assessment...</p>}

      {!loading && !showForm && assessment && (
        <div className={styles.assessmentInfo}>
          <h4>Existing Assessment</h4>
          <p><strong>Questions:</strong> {assessment.questions.length}</p>
          <p><strong>Passing Score:</strong> {assessment.passing_score}%</p>
          <p><strong>Module:</strong> {module.title}</p>
        </div>
      )}

{!loading && !showForm && !assessment && (
          <div className={styles.emptyState}>No assessment found for this module.</div>
        )}
      </div>
    );
};

export default AssessmentForm;