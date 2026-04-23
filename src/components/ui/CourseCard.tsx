import React from 'react';
import styles from './CourseCard.module.css';

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
    const handleStart = (e?: React.MouseEvent | React.KeyboardEvent | React.TouchEvent) => {
      if (e) e.stopPropagation();
      window.open(`/course/${id}`, '_blank');
    };

  return (
      <button 
        className={styles.card} 
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
         {progress && progress > 0 ? (
           <><i className="fa-solid fa-play"></i> Continue</>
         ) : (
           <><i className="fa-solid fa-play"></i> Start</>
           )}
       </div>
    </button>
  );
};

export default CourseCard;
