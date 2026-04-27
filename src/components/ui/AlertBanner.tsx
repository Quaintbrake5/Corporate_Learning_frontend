import React from 'react';
import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  actionText?: string;
  onActionClick?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  title, 
  message, 
  type = 'info', 
  actionText,
  onActionClick
}) => {
  const getIconClass = () => {
    switch (type) {
      case 'danger': return 'fa-solid fa-triangle-exclamation';
      case 'warning': return 'fa-solid fa-circle-exclamation';
      case 'success': return 'fa-solid fa-circle-check';
      case 'info':
      default: return 'fa-solid fa-circle-info';
    }
  };

  return (
    <div className={`${styles.banner} ${styles[type]}`}>
      <div className={styles.iconContainer}>
        <i className={getIconClass()}></i>
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.message}>{message}</p>
      </div>
      {actionText && (
        <button className={styles.actionBtn} onClick={onActionClick}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
