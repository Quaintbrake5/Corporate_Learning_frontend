
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import styles from './ProgressWidget.module.css';

const ProgressWidget = () => {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Learning Progress</h3>
        <button className={styles.moreBtn} aria-label="More Options"><FontAwesomeIcon icon={faEllipsis} /></button>
      </div>
      
      <div className={styles.metricsContainer}>
        <div className={styles.metricRow}>
          <div className={styles.dateBox}>
            <span className={styles.day}>Mon</span>
            <span className={styles.date}>18</span>
          </div>
          <div className={styles.progressDetail}>
            <div className={styles.progressHeader}>
              <span className={styles.label}>Mandatory Check</span>
              <span className={styles.percentage}>86%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={`${styles.progressFill} ${styles.progressFillGreen}`} style={{ width: '86%' }}></div>
            </div>
          </div>
          <div className={styles.timeInfo}>
            <span className={styles.timeLabel}>Time Spent</span>
            <span className={styles.timeValue}>5h 12m</span>
          </div>
        </div>

        <div className={`${styles.metricRow} ${styles.metricRowAlt}`}>
          <div className={`${styles.dateBox} ${styles.dateBoxAlt}`}>
            <span className={styles.day}>Tue</span>
            <span className={styles.date}>19</span>
          </div>
          <div className={styles.progressDetail}>
            <div className={styles.progressHeader}>
              <span className={`${styles.label} ${styles.labelAlt}`}>ISPS Code Update</span>
              <span className={styles.percentage}>72%</span>
            </div>
            <div className={`${styles.progressBar} ${styles.progressBarAlt}`}>
              <div className={`${styles.progressFill} ${styles.progressFillGreen}`} style={{ width: '72%' }}></div>
            </div>
          </div>
          <div className={styles.timeInfo}>
            <span className={`${styles.timeLabel} ${styles.timeLabelAlt}`}>Time Spent</span>
            <span className={`${styles.timeValue} ${styles.timeValueAlt}`}>4h 10m</span>
          </div>
        </div>

        <div className={styles.metricRow}>
          <div className={styles.dateBox}>
            <span className={styles.day}>Wed</span>
            <span className={styles.date}>20</span>
          </div>
          <div className={styles.progressDetail}>
            <div className={styles.progressHeader}>
              <span className={styles.label}>Agile Leadership</span>
              <span className={styles.percentage}>60%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={`${styles.progressFill} ${styles.progressFillBlue}`} style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className={styles.timeInfo}>
            <span className={styles.timeLabel}>Time Spent</span>
            <span className={styles.timeValue}>3h 05m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
