import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AlertBanner from '../../components/ui/AlertBanner';
import StatCard from '../../components/ui/StatCard';
import AnalyticsPlaceholder from '../../components/ui/AnalyticsPlaceholder';
import CourseCard from '../../components/ui/CourseCard';
import { getUserProfile } from '../../services/userService';
import type { UserProfile } from '../../services/userService';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile from mock service
    const profile = getUserProfile();
    setUserProfile(profile);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.dashboardContainer}>
          <div className={styles.headerSection}>
            <div>
              <h1 className={styles.title}>Welcome back!</h1>
              <p className={styles.subtitle}>Loading your profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className={styles.dashboardContainer}>
          <div className={styles.headerSection}>
            <div>
              <h1 className={styles.title}>Welcome back!</h1>
              <p className={styles.subtitle}>Unable to load profile</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Define subdivision-specific learning path courses
  const getLearningPathCourses = (subdivision: string) => {
    switch (subdivision) {
      case 'CSD':
        return [
          {
            id: 'csd-agile-fundamentals',
            title: 'Agile Fundamentals for CSD',
            subdivision: 'CSD',
            duration: '3h 00m',
            progress: 60,
            isMandatory: true
          },
          {
            id: 'csd-devops-practices',
            title: 'DevOps Practices in CSD',
            subdivision: 'CSD',
            duration: '4h 00m',
            progress: 30,
            isMandatory: true
          },
          {
            id: 'csd-security-basics',
            title: 'Security Basics for CSD Teams',
            subdivision: 'CSD',
            duration: '2h 30m',
            progress: 80,
            isMandatory: true
          }
        ];
      case 'CSS':
        return [
          {
            id: 'css-tactical-response',
            title: 'Advanced Tactical Response',
            subdivision: 'CSS',
            duration: '4h 30m',
            progress: 45,
            isMandatory: true
          },
          {
            id: 'css-maritime-security',
            title: 'Maritime Security Protocols',
            subdivision: 'CSS',
            duration: '2h 15m',
            progress: 0,
            isMandatory: true
          },
          {
            id: 'css-emergency-evacuation',
            title: 'Emergency Evacuation Coordination',
            subdivision: 'CSS',
            duration: '1h 45m',
            progress: 100,
            isMandatory: true
          }
        ];
      case 'CSI':
        return [
          {
            id: 'csi-cyber-threat-intel',
            title: 'Cyber Threat Intelligence',
            subdivision: 'CSI',
            duration: '3h 30m',
            progress: 20,
            isMandatory: true
          },
          {
            id: 'csi-network-forensics',
            title: 'Network Forensics Analysis',
            subdivision: 'CSI',
            duration: '4h 00m',
            progress: 10,
            isMandatory: true
          },
          {
            id: 'csi-incident-response',
            title: 'Incident Response Procedures',
            subdivision: 'CSI',
            duration: '2h 45m',
            progress: 50,
            isMandatory: true
          }
        ];
      case 'HR':
        return [
          {
            id: 'hr-talent-management',
            title: 'Talent Management Strategies',
            subdivision: 'HR',
            duration: '3h 00m',
            progress: 40,
            isMandatory: true
          },
          {
            id: 'hr-employee-relations',
            title: 'Employee Relations Best Practices',
            subdivision: 'HR',
            duration: '2h 30m',
            progress: 60,
            isMandatory: true
          },
          {
            id: 'hr-hris-fundamentals',
            title: 'HRIS Fundamentals',
            subdivision: 'HR',
            duration: '3h 30m',
            progress: 25,
            isMandatory: true
          }
        ];
      default:
        // Fallback to CSS if subdivision not recognized
        return [
          {
            id: 'default-course-1',
            title: 'Default Course 1',
            subdivision: subdivision,
            duration: '2h 00m',
            progress: 0,
            isMandatory: true
          },
          {
            id: 'default-course-2',
            title: 'Default Course 2',
            subdivision: subdivision,
            duration: '1h 30m',
            progress: 0,
            isMandatory: true
          }
        ];
    }
  };
  
  // Get learning path courses for current user's subdivision
  const learningPathCourses = getLearningPathCourses(userProfile.subdivision);

  return (
    <DashboardLayout>
      <div className={styles.dashboardContainer}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Welcome back, {userProfile.name}!</h1>
            <p className={styles.subtitle}>Let's check your learning progress</p>
          </div>
        </div>

        {/* Priority 1: Overdue Mandatory Training */}
        <section className={styles.dashboardSection}>
          <AlertBanner
            title="Mandatory Training Overdue"
            message="Your 'ISPS Code Compliance v2' certification expired on March 15th. Please complete it immediately to restore compliance."
            type="danger"
            actionText="Start Course"
          />
        </section>

        {/* Analytics / Progress Section */}
        <section className={`${styles.dashboardSection} ${styles.analyticsGrid}`}>
          <div className={styles.statsColumn}>
            <StatCard
              title="Training Completion"
              value="85%"
              iconClass="fa-solid fa-graduation-cap"
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Learning Hours"
              value="32h"
              iconClass="fa-solid fa-stopwatch"
            />
          </div>
          <div className={styles.chartsColumn}>
            <AnalyticsPlaceholder title="Activity Overview" type="line" height="230px" />
          </div>
        </section>

        {/* Priority 2: Subdivision-specific Learning Path */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Your Learning Path: {userProfile.subdivision}</h2>
            <button className={styles.btnLink}>View All</button>
          </div>
          <div className={styles.coursesGrid}>
            {/* Courses are already filtered by subdivision in getLearningPathCourses */}
            {learningPathCourses.map(course => (
              <CourseCard
                key={course.id}
                title={course.title}
                subdivision={course.subdivision}
                duration={course.duration}
                progress={course.progress}
                isMandatory={course.isMandatory}
              />
            ))}
          </div>
        </section>

        {/* Priority 3: General Elective Catalog */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Recommended Electives</h2>
            <button className={styles.btnLink}>Browse Catalog</button>
          </div>
          <div className={styles.coursesGrid}>
            <CourseCard
              title="Introduction to Agile Methodologies"
              subdivision="CSD"
              duration="3h 00m"
            />
            <CourseCard
              title="Cybersecurity Fundamentals"
              subdivision="CSI"
              duration="2h 30m"
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

export default Dashboard;
