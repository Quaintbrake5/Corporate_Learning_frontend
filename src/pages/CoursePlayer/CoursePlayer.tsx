import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { getCourse, getCourseModules, type Course, type Module } from '../../services/courseService';
import { submitQuizForModule, type QuizQuestion, type QuizSubmitResponse } from '../../services/quizService';
import { sendHeartbeat, getProgress } from '../../services/progressService';
import { enrollInCourse, getEnrollmentStatus } from '../../services/enrollmentService';
import { generateQuizFromContent, type QuizGenerationRequest } from '../../services/aiQuizService';
import styles from './CoursePlayer.module.css';

interface ApiError {
  response?: {
    status?: number;
    data?: { detail?: string };
  };
}

// Extracted component to reduce nesting depth in the quiz form
interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (questionId: string, option: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, selectedAnswer, onSelectAnswer }) => (
  <div className={styles.questionCard}>
    <p>{index + 1}. {question.question}</p>
    {question.options.map((option) => (
      <div key={`${question.question_id}-${option}`} className={styles.option}>
        <input
          type="radio"
          id={`q${question.question_id}-${option}`}
          name={`q${question.question_id}`}
          value={option}
          checked={selectedAnswer === option}
          onChange={() => onSelectAnswer(question.question_id, option)}
        />
        <label htmlFor={`q${question.question_id}-${option}`}>
          {option}
        </label>
      </div>
    ))}
  </div>
);

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
   
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseCompleted, setCourseCompleted] = useState(false);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
      const [videoCompleted, setVideoCompleted] = useState(false);
      const [isVideoPlaying, setIsVideoPlaying] = useState(false);
      const [videoProgress, setVideoProgress] = useState(0);
      const [videoSessionId, setVideoSessionId] = useState('');
      const [learningState, setLearningState] = useState<'not_started' | 'started' | 'paused' | 'finished'>('not_started');
      const [pdfViewed, setPdfViewed] = useState(false);
      const [pdfProgress, setPdfProgress] = useState(0);
      const [scormCompleted, setScormCompleted] = useState(false);
  const videoProgressRef = useRef(0);
  const heartbeatIntervalRef = useRef<number | null>(null);

  const createSessionId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, (char: string) => {
      const random = Math.trunc(Math.random() * 16);
      const value = char === 'x' ? random : (random & 0x3 | 0x8);
      return value.toString(16);
    });
  };

  const formatLearningState = (state: 'not_started' | 'started' | 'paused' | 'finished'): string => {
    switch (state) {
      case 'started':
        return 'Started';
      case 'paused':
        return 'Paused';
      case 'finished':
        return 'Finished';
      default:
        return 'Not Started';
    }
  };

const sendLearningHeartbeat = useCallback(async (
  progress: number,
  activityState: 'started' | 'paused' | 'finished'
) => {
  if (!courseId || !activeModule || !videoSessionId) return;
  const safeProgress = Math.max(0, Math.min(100, progress));
  await sendHeartbeat({
    course_id: courseId,
    module_id: activeModule.id,
    progress_percentage: safeProgress,
    session_id: videoSessionId,
    activity_state: activityState
  });
}, [courseId, activeModule, videoSessionId]);

  const handleStartVideo = () => {
    setIsVideoPlaying(true);
    setLearningState('started');
    const currentProgress = Math.max(videoProgressRef.current, 1);
    void sendLearningHeartbeat(currentProgress, 'started').catch((heartbeatError) => {
      console.warn('Failed to send heartbeat update:', heartbeatError);
    });
  };

   const handlePauseVideo = () => {
     setIsVideoPlaying(false);
     setLearningState('paused');
     const currentProgress = Math.max(videoProgressRef.current, 1);
     void sendLearningHeartbeat(currentProgress, 'paused').catch((heartbeatError) => {
       console.warn('Failed to send heartbeat update:', heartbeatError);
     });
   };

   const handleVideoEnded = () => {
     setIsVideoPlaying(false);
     setVideoCompleted(true);
     setLearningState('finished');
     setVideoProgress(100);
     videoProgressRef.current = 100;
   };

   // Helper function to handle start/pause for all content types
   const handleToggleActivity = () => {
     if (activeModule?.content_type === 'video') {
       if (isVideoPlaying) {
         handlePauseVideo();
       } else {
         handleStartVideo();
       }
     } else if (activeModule?.content_type === 'pdf') {
       // For PDF, toggle between started and paused states
       if (learningState === 'started') {
         setLearningState('paused');
       } else {
         setLearningState('started');
       }
     } else if (activeModule?.content_type === 'scorm') {
       // For SCORM, toggle between started and paused states
       if (learningState === 'started') {
         setLearningState('paused');
       } else {
         setLearningState('started');
       }
     }
   };

   // Helper function to get overall progress based on content type
   const getOverallProgress = () => {
     if (activeModule?.content_type === 'video') {
       return videoProgress;
     } else if (activeModule?.content_type === 'pdf') {
       return pdfProgress;
     } else if (activeModule?.content_type === 'scorm') {
       return scormCompleted ? 100 : 0;
     }
     return 0;
   };

   // Helper function to check if activity is active (playing/started)
   const isActive = () => {
     if (activeModule?.content_type === 'video') {
       return isVideoPlaying;
     } else if (activeModule?.content_type === 'pdf' || activeModule?.content_type === 'scorm') {
       return learningState === 'started';
     }
     return false;
   };

    const handleSelectAnswer = (questionId: string, option: string) => {
      setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleLoadQuiz = () => {
      setQuizLoading(true);
      setQuizError(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizResult(null);
    };

     // Wait for enrollment progress to reach 100% with retry mechanism
     const waitForEnrollmentCompletion = async (courseId: string): Promise<void> => {
       const maxAttempts = 10;
       const delayMs = 500; // 500ms between attempts
       
       for (let attempt = 0; attempt < maxAttempts; attempt++) {
         try {
           // Get user ID from localStorage
           const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '';
           if (!userId) {
             throw new Error('User ID not found');
           }
           
           const progress = await getProgress(userId, courseId);
           
           if (progress && progress.progress_percentage >= 100) {
             return; // Success - progress is complete
           }
           
           // If not complete yet, wait and retry (unless this is the last attempt)
           if (attempt < maxAttempts - 1) {
             await new Promise(resolve => setTimeout(resolve, delayMs));
           }
         } catch (error) {
           console.warn(`Attempt ${attempt + 1} failed to check progress:`, error);
           if (attempt < maxAttempts - 1) {
             await new Promise(resolve => setTimeout(resolve, delayMs));
           }
         }
       }
       
       // If we've exhausted all attempts, throw an error
       throw new Error('Enrollment progress did not reach 100% after multiple attempts');
     };

    // Reset video and tracking state when switching modules
    useEffect(() => {
      setVideoCompleted(false);
      setIsVideoPlaying(false);
      setVideoProgress(0);
      videoProgressRef.current = 0;
      setLearningState('not_started');
      setVideoSessionId(createSessionId());
    }, [activeModule?.id]);

      useEffect(() => {
        // Determine if we should send heartbeats based on content type and state
        const shouldSendHeartbeat = 
          (activeModule?.content_type === 'video' && isVideoPlaying) ||
          (activeModule?.content_type === 'pdf' && learningState === 'started') ||
          (activeModule?.content_type === 'scorm' && learningState === 'started');

        if (!shouldSendHeartbeat || !activeModule) {
          if (heartbeatIntervalRef.current !== null) {
            window.clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          return;
        }

        heartbeatIntervalRef.current = window.setInterval(() => {
          let currentProgress = 0;
          let activityState = 'started';

          if (activeModule.content_type === 'video') {
            currentProgress = Math.max(videoProgressRef.current, 1);
          } else if (activeModule.content_type === 'pdf') {
            currentProgress = pdfProgress;
          } else if (activeModule.content_type === 'scorm') {
            currentProgress = scormCompleted ? 100 : 0;
          }

          void sendLearningHeartbeat(currentProgress, activityState).catch((heartbeatError) => {
            console.warn('Failed to send heartbeat update:', heartbeatError);
          });
        }, 30000);

        return () => {
          if (heartbeatIntervalRef.current !== null) {
            window.clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
        };
      }, [activeModule, isVideoPlaying, learningState, videoProgressRef, pdfProgress, scormCompleted, videoSessionId, sendLearningHeartbeat]);
 
        // Handle module completion for quiz generation (works for all content types)
        useEffect(() => {
          // Early return conditions for better readability
          if (!activeModule) return;
          if (showQuiz || quizQuestions.length > 0 || quizSubmitted) return;
          
          // Check if module is complete based on content type
          let isComplete = false;
          switch (activeModule.content_type) {
            case 'video':
              isComplete = videoCompleted;
              break;
            case 'pdf':
              isComplete = pdfViewed;
              break;
            case 'scorm':
              isComplete = scormCompleted;
              break;
            default:
              isComplete = false;
          }
          
          if (!isComplete) return;
          
          const handleModuleComplete = async () => {
            try {
              // Validate courseId before sending heartbeat
              if (!courseId) {
                throw new Error('Course ID is required to record progress');
              }
              
               // Send heartbeat with 100% progress
               await sendLearningHeartbeat(100, 'finished');
               
              // Wait for enrollment progress to update with retry mechanism
              // This handles race condition where assessment fetch happens before 
              // heartbeat updates enrollment progress in database
              await waitForEnrollmentCompletion(courseId);
              
               // Generate quiz for this module using AI (works for all content types)
               const quizRequest: QuizGenerationRequest = {
                 contentType: activeModule.content_type as 'video' | 'pdf' | 'scorm',
                 contentUrl: activeModule.content_url,
                 moduleId: activeModule.id,
                 courseId: courseId
               };
               
               // For SCORM, we might need to pass additional data
               if (activeModule.content_type === 'scorm' && activeModule.scorm_data) {
                 // In a real implementation, we'd process the SCORM data first
                 // For now, we'll pass what we have
                 quizRequest.contentData = activeModule.scorm_data;
               }
              
              const quizResponse = await generateQuizFromContent(quizRequest);
              setQuizQuestions(quizResponse.questions);
              setShowQuiz(true);
              
            } catch (err) {
              console.error('Error handling module completion:', err);
              const apiError = err as ApiError;
              if (apiError.response?.status === 404) {
                setQuizError('No assessment available for this module.');
              } else {
                const message = err instanceof Error ? err.message : 'Failed to load quiz';
                setQuizError(message);
              }
              setShowQuiz(true);
            } finally {
              setQuizLoading(false);
            }
          };
          
          setQuizLoading(true);
          handleModuleComplete();
        }, [activeModule, courseId, videoCompleted, pdfViewed, scormCompleted, sendLearningHeartbeat, showQuiz, quizQuestions.length, quizSubmitted]);

    // Handle quiz submission
    const handleQuizSubmit = async () => {
      try {
        // Convert quizAnswers to the format expected by the API
        const answers = Object.keys(quizAnswers).map(question_id => ({
          question_id,
          selected_option: quizAnswers[question_id]
        }));
        
        const payload = {
          answers,
          time_spent: 0 // We're not tracking time spent for simplicity
        };
        
        // Ensure activeModule is not null before accessing its id
        if (!activeModule) {
          throw new Error('Active module is required to submit quiz');
        }
        const result = await submitQuizForModule(activeModule.id, payload);
        setQuizResult(result);
        setQuizSubmitted(true);
      } catch (err) {
        console.error('Error submitting quiz:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setQuizError(message || 'Failed to submit quiz');
      }
    };

  useEffect(() => {
    if (!courseId) {
      setError('Course ID is missing. Please navigate from the courses page.');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);

        // Check enrollment status first
        try {
          const enrollmentStatus = await getEnrollmentStatus(courseId);
          if (enrollmentStatus.status === 'completed') {
            setCourseCompleted(true);
            setCourse({
              id: enrollmentStatus.course_id,
              title: enrollmentStatus.title,
              description: enrollmentStatus.description || '',
              duration_in_minutes: enrollmentStatus.duration_in_minutes || 0,
              is_mandatory: enrollmentStatus.is_mandatory || false,
              department_owner: enrollmentStatus.department_owner || '',
              thumbnail_url: enrollmentStatus.thumbnail_url || '',
            } as Course);
            setLoading(false);
            return;
          }
        } catch {
          // Not enrolled yet, proceed to load course
        }

        const [courseData, modulesData] = await Promise.all([
          getCourse(courseId),
          getCourseModules(courseId)
        ]);
        setCourse(courseData);
        if (Array.isArray(modulesData) && modulesData.length > 0) {
          setModules(modulesData);
          setActiveModule(modulesData[0]);
        } else {
          // No modules - try to auto-enroll and reload
          console.log('[CoursePlayer] No modules found, attempting auto-enrollment...');
          try {
            await enrollInCourse(courseId);
            console.log('[CoursePlayer] Auto-enrolled successfully, reloading modules...');
            const reloadedModules = await getCourseModules(courseId);
            if (Array.isArray(reloadedModules) && reloadedModules.length > 0) {
              setModules(reloadedModules);
              setActiveModule(reloadedModules[0]);
            } else {
              setModules([]);
              setError('No training modules found for this course. Please contact your administrator.');
            }
          } catch (enrollErr: unknown) {
            const enrollError = enrollErr as ApiError;
            console.error('[CoursePlayer] Auto-enrollment failed:', enrollErr);
            if (enrollError.response?.status === 403) {
              setError('Access Denied: You do not have permission to enroll in this course.');
            } else if (enrollError.response?.status === 409) {
              setError('No training modules found for this course. Please contact your administrator.');
            } else {
              setError('Failed to enroll in course. Please try again or contact support.');
            }
          }
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        console.error('Failed to load course data:', err);
        if (error.response?.status === 403) {
          console.log('[CoursePlayer] Access denied on load, attempting enrollment...');
          try {
            await enrollInCourse(courseId);
            const [courseData, modulesData] = await Promise.all([
              getCourse(courseId),
              getCourseModules(courseId)
            ]);
            setCourse(courseData);
            if (Array.isArray(modulesData) && modulesData.length > 0) {
              setModules(modulesData);
              setActiveModule(modulesData[0]);
            } else {
              setModules([]);
              setError('No training modules found for this course. Please contact your administrator.');
            }
          } catch (enrollErr) {
            console.error('[CoursePlayer] Enrollment failed after 403:', enrollErr);
            setError('Access Denied: You do not have permission to view this course content.');
          }
        } else {
          setError('Failed to load course content. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

    if (loading) return <div className={styles.loading}>Loading training content...</div>;
    if (courseCompleted) return (
      <div className={styles.completedBlock}>
        <i className="fa-solid fa-circle-check" style={{ fontSize: '64px', color: '#059669', marginBottom: '16px' }}></i>
        <h2>Course Completed</h2>
        <p>You have already completed this course. Completed courses cannot be replayed.</p>
        <button onClick={() => window.close()} className={styles.closeCompletedBtn}>
          Close
        </button>
      </div>
    );
    if (error || !course) return <div className={styles.error}>{error || 'Course not found'}</div>;

    // Calculate module index safely
    const moduleIndex = Array.isArray(modules) && activeModule ? modules.indexOf(activeModule) : -1;
    const moduleNumber = moduleIndex === -1 ? 0 : moduleIndex + 1;
    const totalModules = Array.isArray(modules) ? modules.length : 0;

    const renderQuizResult = () => {
      if (!quizResult) return null;
      return (
        <div className={styles.quizResult}>
          <h2>Quiz Result</h2>
          <p>Score: {quizResult.score}%</p>
          <p>Status: {quizResult.pass_fail === 'pass' ? 'Passed' : 'Failed'}</p>
          <p>{quizResult.message}</p>
          {quizResult.pass_fail === 'fail' && quizResult.missed_topics && quizResult.missed_topics.length > 0 && (
            <div>
              <h3>Missed Topics:</h3>
              <ul>
                {quizResult.missed_topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          )}
          {quizResult.pass_fail === 'fail' && (
            <button onClick={() => {
              setQuizSubmitted(false);
              setQuizResult(null);
              setQuizAnswers({});
            }} className={styles.retakeButton}>
              Retake Quiz
            </button>
          )}
          {quizResult.pass_fail === 'pass' && (
            <p>
              Congratulations! You have passed the quiz. A certificate will be generated for this module.
            </p>
          )}
        </div>
      );
    };

     const renderContent = () => {
       if (!activeModule) return null;

       // If quiz is submitted, show result
       if (quizSubmitted && quizResult) {
         return renderQuizResult();
       }

       // If quiz is showing, render it
       if (showQuiz || quizQuestions.length > 0) {
         return renderQuiz();
       }

       return renderContentByType(activeModule.content_type);
     };

     const renderQuiz = () => {
       return (
         <div className={styles.quizContainer}>
           <h2>Quiz</h2>
           {quizLoading && <p>Loading quiz...</p>}
            {quizError && <p className={styles.error}>{quizError}</p>}
           {!quizLoading && quizQuestions.length > 0 && (
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   handleQuizSubmit();
                 }}>
                 {quizQuestions.map((question, index) => (
                   <QuestionCard
                     key={question.question_id}
                     question={question}
                     index={index}
                     selectedAnswer={quizAnswers[question.question_id]}
                     onSelectAnswer={handleSelectAnswer}
                   />
                 ))}
                 <button type="submit" className={styles.submitQuizButton}>
                   Submit Quiz
                 </button>
               </form>
             )}
           </div>
       );
     };

     const renderContentByType = (contentType: string) => {
       if (!activeModule) return null;
       switch (contentType) {
          case 'video':
            if (!activeModule.content_url) {
              return (
                <div className={styles.unsupported}>
                  <i className="fa-solid fa-video-slash"></i>
                  <p>No video URL provided for this module.</p>
                </div>
              );
            }
return (
  <div className={styles.videoWrapper}>
      <ReactPlayer
                    src={activeModule.content_url}
                    {...({ url: activeModule.content_url } as Record<string, unknown>)}
                    controls={true}
                    width="100%"
                    height="100%"
                    className={styles.videoFrame}
                    playing={isVideoPlaying}
                    onPlay={() => {
                      setLearningState('started');
                      const currentProgress = Math.max(videoProgressRef.current, 1);
                      void sendLearningHeartbeat(currentProgress, 'started').catch((heartbeatError) => {
                        console.warn('Failed to send heartbeat update:', heartbeatError);
                      });
                    }}
                    onPause={() => {
                      if (videoCompleted) return;
                      setLearningState('paused');
                      const currentProgress = Math.max(videoProgressRef.current, 1);
                      void sendLearningHeartbeat(currentProgress, 'paused').catch((heartbeatError) => {
                        console.warn('Failed to send heartbeat update:', heartbeatError);
                      });
                    }}
                    onTimeUpdate={(event) => {
                      const { currentTime, duration } = event.currentTarget;
                      const progressValue = duration > 0
                        ? Math.round((currentTime / duration) * 100)
                        : videoProgressRef.current;
                      setVideoProgress(progressValue);
                      videoProgressRef.current = progressValue;
                    }}
                    onError={(event) => {
                      console.error('ReactPlayer Error:', event);
                      setError('Format not supported or link is broken. Check console for details.');
                    }}
                    onEnded={handleVideoEnded}
                    config={{
                      html: {
                        controlsList: 'nodownload',
                        style: { width: '100%', height: '100%', objectFit: 'contain' }
                      }
                    }}
                  />
                  {videoCompleted && quizLoading && (
                    <div className={styles.videoCompletedActions}>
                      <p>Loading quiz...</p>
                    </div>
                  )}
              </div>
            );
           case 'pdf':
             return (
               <div className={styles.pdfWrapper}>
                 <div className={styles.pdfProgressContainer}>
                   <div className={styles.pdfProgressBar}>
                     <div 
                       className={styles.pdfProgressFill} 
                       style={{ width: `${pdfProgress}%` }}
                     ></div>
                   </div>
                   <span className={styles.pdfProgressText}>
                     {pdfProgress}% Complete
                   </span>
                 </div>
                 <iframe
                   src={activeModule.content_url || ''}
                   title={activeModule.title}
                   className={styles.pdfFrame}
                   onLoad={() => {
                     // Reset progress when PDF loads
                     setPdfProgress(0);
                     // Simulate PDF reading progress
                     const interval = setInterval(() => {
                       setPdfProgress(prev => {
                         const newProgress = Math.min(prev + 10, 100);
                         if (newProgress >= 100) {
                           setPdfViewed(true);
                           clearInterval(interval);
                         }
                         return newProgress;
                       });
                     }, 3000); // Update every 3 seconds
                   }}
                  ></iframe>
                  {pdfViewed && quizLoading && (
                    <div className={styles.videoCompletedActions}>
                      <p>Loading quiz...</p>
                    </div>
                  )}
                </div>
             );
          case 'scorm':
            return (
              <div className={styles.scormWrapper}>
                {/* In a real implementation, we'd use a proper SCORM player */}
                <div className={styles.scormPlaceholder}>
                  <h3>SCORM Content</h3>
                  <p>{activeModule.title}</p>
                  {/* Simulate SCORM completion tracking */}
                  <button 
                    onClick={() => {
                      // Simulate SCORM completion after user interaction
                      setScormCompleted(true);
                    }}
                    className={styles.completeScormButton}
                  >
                    Mark as Complete
                  </button>
                  {scormCompleted && (
                    <div className={styles.scormCompletionMessage}>
                      <p>SCORM module completed!</p>
                    </div>
                  )}
                </div>
              </div>
            );
          default:
            return <div className={styles.unsupported}>Unsupported content type: {contentType}</div>;
       }
     };

   return (
      <div className={styles.playerPage}>
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            <div className={styles.headerLeft}>
              <button onClick={() => window.close()} className={styles.backBtn}>
                <i className="fa-solid fa-xmark"></i> Close Player
              </button>
              <div className={styles.divider}></div>
              <h1 className={styles.courseTitle}>{course.title}</h1>
            </div>
            <div className={styles.headerRight}>
               <span className={styles.moduleBadge}>Module {moduleNumber} of {totalModules}</span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.layoutContainer}>
            <div className={styles.contentArea}>
           {renderContent()}
           <div className={styles.contentInfo}>
              <h2>{activeModule?.title}</h2>
              <p>{course.description}</p>
           </div>
         </div>

<aside className={styles.sidebar}>
  <h3 className={styles.sidebarTitle}>Course Content</h3>
  <div className={styles.moduleList}>
    {Array.isArray(modules) ? modules.map((m, index) => (
      <button
        key={m.id}
        className={`${styles.moduleItem} ${activeModule?.id === m.id ? styles.active : ''}`}
        onClick={() => setActiveModule(m)}
      >
        <div className={styles.moduleNumber}>{index + 1}</div>
        <div className={styles.moduleMeta}>
          <span className={styles.moduleItemTitle}>{m.title}</span>
          <span className={styles.moduleType}>
            <i className={m.content_type === 'video' ? 'fa-solid fa-circle-play' : 'fa-solid fa-file-pdf'}></i>
            {m.content_type.toUpperCase()}
          </span>
        </div>
      </button>
    )) : []}
    {/* Start button and Progress report moved to moduleList bottom right */}
     {activeModule && (
       <div className={styles.moduleProgressContainer}>
         <button
           type="button"
           onClick={handleToggleActivity}
           className={styles.videoControlButton}
         >
           {isActive ? 'Pause' : 'Start'}
         </button>
         <span className={styles.videoStatusBadge}>
           {formatLearningState(learningState)} • {getOverallProgress()}%
         </span>
       </div>
     )}
  </div>
</aside>
          </div>
        </main>
      </div>
   );
};

export default CoursePlayer;
