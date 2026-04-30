import React, { useState } from 'react';
import styles from './CourseCard.module.css';
import { enrollInCourse } from '../../services/enrollmentService';

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
  const [enrolling, setEnrolling] = useState(false);

  const handleStart = async (e?: React.MouseEvent | React.KeyboardEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();

    // If already has progress, just navigate
    if (progress !== undefined && progress > 0) {
      window.open(`/course/${id}`, '_blank');
      return;
    }

    // Try to enroll first (idempotent - 409 is fine)
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      console.log('[CourseCard] Successfully enrolled in course:', id);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      // 409 = already enrolled, which is fine
      if (error.response?.status === 409) {
        console.log('[CourseCard] Already enrolled in course:', id);
      } else {
        console.error('[CourseCard] Enrollment failed:', err);
        // Still navigate - let the course page handle any access issues
      }
    } finally {
      setEnrolling(false);
    }

    window.open(`/course/${id}`, '_blank');
  };

  return (
      <button 
        className={styles.card}
        disabled={enrolling}
        onClick={handleStart}
        onTouchStart={(e) => {
          e.preventDefault();
          handleStart(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleStart(e);
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
        
        {progress !== undefined && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressValue}>{progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
       <div className={`${styles.footer} ${styles.actionBtn}`}>
         {enrolling ? (
           <><i className="fa-solid fa-spinner fa-spin"></i> Enrolling...</>
         ) : progress && progress > 0 ? (
           <><i className="fa-solid fa-play"></i> Continue</>
         ) : (
           <><i className="fa-solid fa-play"></i> Start</>
         )}
       </div>
    </button>
  );
};

export default CourseCard;
