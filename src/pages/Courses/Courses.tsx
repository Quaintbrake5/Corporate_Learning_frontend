import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CourseCard from '../../components/ui/CourseCard';
import styles from './Courses.module.css';

const Courses: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Courses</h1>
          <p className={styles.subtitle}>Explore and manage all your learning activities.</p>
        </div>

        <section className={styles.section}>
          <h2>Mandatory Training</h2>
          <div className={styles.grid}>
            <CourseCard 
              title="ISPS Code Compliance v2"
              subdivision="CSS"
              duration="2h 00m"
              progress={0}
              isMandatory={true}
            />
            <CourseCard 
              title="Advanced Tactical Response"
              subdivision="CSS"
              duration="4h 30m"
              progress={45}
              isMandatory={true}
            />
            <CourseCard 
              title="Emergency Evacuation Coordination"
              subdivision="CSS"
              duration="1h 45m"
              progress={100}
              isMandatory={true}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Elective Courses</h2>
          <div className={styles.grid}>
            <CourseCard 
              title="Introduction to Agile Methodologies"
              subdivision="CSD"
              duration="3h 00m"
            />
            <CourseCard 
              title="Cybersecurity Fundamentals"
              subdivision="CSI"
              duration="2h 30m"
              progress={15}
            />
            <CourseCard 
              title="Effective Communication in Teams"
              subdivision="HR"
              duration="1h 15m"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
