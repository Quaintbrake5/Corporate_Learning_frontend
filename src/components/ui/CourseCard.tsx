import React from 'react';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  title: string;
  subdivision?: string;
  duration?: string;
  progress?: number;
  isMandatory?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  subdivision, 
  duration, 
  progress, 
  isMandatory 
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        {isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
        {!isMandatory && <span className={styles.electiveBadge}>Elective</span>}
      </div>
      
      <div className={styles.body}>
        <h4 className={styles.title}>{title}</h4>
        
        <div className={styles.meta}>
          {subdivision && (
            <span className={styles.metaItem}>
              <i className="fa-solid fa-building"></i>
              {subdivision}
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
      
      <div className={styles.footer}>
        <button className={styles.actionBtn}>
          {progress && progress > 0 ? (
            <><i className="fa-solid fa-play"></i> Continue</>
          ) : (
            <><i className="fa-solid fa-play"></i> Start</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
