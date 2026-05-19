import React, { useState } from 'react';
import styles from './CourseEnrollmentModal.module.css';
import { enrollInCourse } from '../../services/enrollmentService';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description?: string;
    duration_in_minutes?: number;
    is_mandatory?: boolean;
    department_owner?: string;
    thumbnail_url?: string;
    enrolled?: boolean;
    status?: string;
    progress_percentage?: number;
    completion_date?: string;
    deadline_date?: string;
  } | null;
  onEnrollSuccess: (courseId: string) => void;
}

const departmentMap: Record<string, string> = {
  '1': 'CS',
  '2': 'ENG',
  '3': 'OPS',
  '4': 'FIN',
  '5': 'HR',
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({ isOpen, onClose, course, onEnrollSuccess }) => {
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !course) return null;

  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    try {
      await enrollInCourse(course.id);
      onEnrollSuccess(course.id);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      if (error.response?.status === 409) {
        onEnrollSuccess(course.id);
        onClose();
      } else {
        setError(error.response?.data?.detail || 'Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    window.open(`/course/${course.id}`, '_blank');
    onClose();
  };

  const isCompleted = course.status === 'completed';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {course.thumbnail_url && (
          <div className={styles.thumbnail} style={{ backgroundImage: `url(${course.thumbnail_url})` }} />
        )}

        <div className={styles.content}>
          <div className={styles.badges}>
            {course.is_mandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
            {!course.is_mandatory && <span className={styles.electiveBadge}>Elective</span>}
            {course.department_owner && (
              <span className={styles.deptBadge}>{departmentMap[course.department_owner] || course.department_owner}</span>
            )}
          </div>

          <h2 className={styles.title}>{course.title}</h2>

          {course.description && <p className={styles.description}>{course.description}</p>}

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <i className="fa-regular fa-clock"></i>
              <span>{formatDuration(course.duration_in_minutes)}</span>
            </div>
            {course.deadline_date && !isCompleted && (
              <div className={styles.metaItem}>
                <i className="fa-regular fa-calendar"></i>
                <span>Due: {new Date(course.deadline_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {course.enrolled && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Status: <strong>{course.status?.replace('_', ' ')}</strong></span>
                <span>{course.progress_percentage ?? 0}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${course.progress_percentage ?? 0}%` }} />
              </div>
              {course.completion_date && (
                <p className={styles.completionNote}>
                  Completed on {new Date(course.completion_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {isCompleted ? (
              <button className={styles.completedBtn} disabled>
                <i className="fa-solid fa-check-circle"></i> Course Completed
              </button>
            ) : course.enrolled ? (
              <button className={styles.primaryBtn} onClick={handleStartCourse}>
                <i className="fa-solid fa-play"></i> {course.progress_percentage && course.progress_percentage > 0 ? 'Continue' : 'Start Course'}
              </button>
            ) : (
              <button className={styles.primaryBtn} onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Enrolling...</>
                ) : (
                  <><i className="fa-solid fa-user-plus"></i> Enroll Now</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentModal;
