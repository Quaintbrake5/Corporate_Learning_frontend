import React from 'react';
import styles from './AnalyticsPlaceholder.module.css';

interface AnalyticsPlaceholderProps {
  title: string;
  type?: 'line' | 'bar' | 'pie';
  height?: string;
  description?: string;
}

const AnalyticsPlaceholder: React.FC<AnalyticsPlaceholderProps> = ({ 
  title, 
  type = 'line', 
  height = '240px',
  description
}) => {
  const getIcon = () => {
    switch(type) {
      case 'bar': return 'fa-solid fa-chart-column';
      case 'pie': return 'fa-solid fa-chart-pie';
      case 'line':
      default: return 'fa-solid fa-chart-line';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      
      <div className={styles.chartArea} style={{ height }}>
        <div className={styles.placeholder}>
          <div className={styles.iconWrapper}>
            <i className={getIcon()}></i>
          </div>
          <p className={styles.placeholderText}>
            Analytics visualization will be rendered here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaceholder;
