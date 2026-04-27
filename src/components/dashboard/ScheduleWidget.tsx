
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import styles from './ScheduleWidget.module.css';

const events = [
  { id: 1, time: '09:30 AM', title: 'SAP ERP Maintenance Demo', status: 'Working On', icon: faServer, color: '#3b82f6' },
  { id: 2, time: '10:40 AM', title: 'Data Privacy Assessment', status: 'Upcoming', icon: faShieldHalved, color: '#10b981' },
  { id: 3, time: '11:50 AM', title: 'Scrum Master Check-in', status: 'Pending', icon: faUsers, color: '#f59e0b' }
];

const ScheduleWidget: React.FC = () => {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upcoming Schedule</h3>
        <button className={styles.viewAll}>See All</button>
      </div>
      
      <div className={styles.timeline}>
        {events.map((evt, idx) => (
          <div key={evt.id} className={styles.timelineItem}>
            <div className={styles.timeCol}>
              <span className={styles.time}>{evt.time}</span>
            </div>
            
            <div className={styles.dividerCol}>
              <div className={styles.dot} style={{ backgroundColor: evt.color }}></div>
              {idx < events.length - 1 && <div className={styles.line}></div>}
            </div>
            
            <div className={styles.contentCol}>
              <div className={styles.eventCard}>
                <div className={styles.eventIcon} style={{ color: evt.color, backgroundColor: `${evt.color}15` }}>
                  <FontAwesomeIcon icon={evt.icon} />
                </div>
                <div className={styles.eventDetails}>
                  <h4 className={styles.eventTitle}>{evt.title}</h4>
                  <span className={styles.eventStatus}>{evt.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className={styles.actionBtn}>
        See All Activity
      </button>
    </div>
  );
};

export default ScheduleWidget;
