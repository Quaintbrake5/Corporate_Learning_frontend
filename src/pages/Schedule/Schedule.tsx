import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ScheduleWidget from '../../components/dashboard/ScheduleWidget';
import styles from './Schedule.module.css';

const Schedule: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Schedule</h1>
          <p className={styles.subtitle}>Manage your upcoming training sessions and meetings.</p>
        </div>

        <div className={styles.content}>
          <div className={styles.calendarArea}>
            <div className={styles.calendarPlaceholder}>
              <i className="fa-regular fa-calendar-days"></i>
              <p>Full Calendar View</p>
            </div>
          </div>
          <div className={styles.sidebarArea}>
            <ScheduleWidget />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
