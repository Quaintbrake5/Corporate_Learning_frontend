import React, { useState } from 'react';
import styles from './CourseCard.module.css';
import CourseEnrollmentModal from './CourseEnrollmentModal';
import { getEnrollmentStatus, type EnrollmentStatus } from '../../services/enrollmentService';

interface CourseCardProps {
  id: string;
  title: string;
  department?: string;
  duration?: string;
  progress?: number;
  isMandatory?: boolean;
  thumbnailUrl?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  id,
  title, 
  department, 
  duration, 
  progress, 
  isMandatory,
  thumbnailUrl
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState<EnrollmentStatus | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleCardClick = async () => {
    if (!id) {
      console.warn('[CourseCard] No course ID provided, ignoring click');
      return;
    }
    setLoadingDetails(true);
    setModalOpen(true);
    try {
      const status = await getEnrollmentStatus(id);
      setCourseDetails(status);
    } catch {
      setCourseDetails({
        course_id: id,
        title,
        is_mandatory: isMandatory,
        department_owner: department,
        thumbnail_url: thumbnailUrl,
        enrolled: false,
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEnrollSuccess = () => {
    window.location.reload();
  };

  const displayProgress = progress !== undefined ? progress : (courseDetails?.progress_percentage ?? 0);
  const isCompleted = courseDetails?.status === 'completed';

  if (!id) {
    console.warn('[CourseCard] Rendering without id:', { title });
    return null;
  }

  return (
    <>
      <button 
        className={styles.card}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div 
          className={styles.header} 
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'transparent' } : {}}
        >
          {!thumbnailUrl && (
            <div className={styles.iconContainer}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          )}
          {isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
          {!isMandatory && <span className={styles.electiveBadge}>Elective</span>}
          {isCompleted && <span className={styles.completedOverlay}><i className="fa-solid fa-check-circle"></i> Completed</span>}
        </div>
        
        <div className={styles.body}>
          <h4 className={styles.title}>{title}</h4>
          
          <div className={styles.meta}>
            {department && (
              <span className={styles.metaItem}>
                <i className="fa-solid fa-building"></i>
                {department}
              </span>
            )}
            {duration && (
              <span className={styles.metaItem}>
                <i className="fa-regular fa-clock"></i>
                {duration}
              </span>
            )}
          </div>
          
          {displayProgress !== undefined && displayProgress > 0 && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Progress</span>
                <span className={styles.progressValue}>{displayProgress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${displayProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className={`${styles.footer} ${styles.actionBtn}`}>
          {isCompleted ? (
            <><i className="fa-solid fa-check"></i> Completed</>
          ) : displayProgress && displayProgress > 0 ? (
            <><i className="fa-solid fa-play"></i> Continue</>
          ) : (
            <><i className="fa-solid fa-eye"></i> View Details</>
          )}
        </div>
      </button>

      <CourseEnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        course={loadingDetails ? { id, title, is_mandatory: isMandatory, department_owner: department, thumbnail_url: thumbnailUrl } : courseDetails}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </>
  );
};

export default CourseCard;
