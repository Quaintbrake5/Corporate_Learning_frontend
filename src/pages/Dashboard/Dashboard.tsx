import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AlertBanner from '../../components/ui/AlertBanner';
import StatCard from '../../components/ui/StatCard';
import AnalyticsPlaceholder from '../../components/ui/AnalyticsPlaceholder';
import CourseCard from '../../components/ui/CourseCard';
import { useAppSelector } from '../../store/hooks';
import { getCourses, type Course } from '../../services/courseService';
import styles from './Dashboard.module.css';

const subdivisionMap: Record<number, string> = {
  1: 'CS',
  2: 'ENG',
  3: 'OPS',
  4: 'FIN',
  5: 'HR',
};

const getSubdivisionName = (id: number): string => {
  return subdivisionMap[id] ?? 'Unknown';
};

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h 00m`;
  return `0h ${m}m`;
};

const Dashboard: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError(null);
        const data = await getCourses(1, 20) as any;
        setCourses(Array.isArray(data) ? data : (data?.items || []));
      } catch (err) {
        setCoursesError('Failed to load courses. Please try again later.');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (!user) {
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

  const userSubdivision = getSubdivisionName(user.subdivision_id);

  const learningPathCourses = courses
    .filter(c => c.subdivision_owner === userSubdivision || c.is_cross_subdivision)
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className={styles.dashboardContainer}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Welcome back, {user.name}!</h1>
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
            <h2>Your Learning Path: {userSubdivision}</h2>
            <button className={styles.btnLink}>View All</button>
          </div>
          <div className={styles.coursesGrid}>
            {coursesLoading ? (
              <p>Loading courses...</p>
            ) : coursesError ? (
              <p>{coursesError}</p>
            ) : learningPathCourses.length === 0 ? (
              <p>No courses available for your subdivision.</p>
            ) : (
              learningPathCourses.map(course => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  subdivision={course.subdivision_owner}
                  duration={formatDuration(course.duration_in_minutes)}
                  isMandatory={course.is_mandatory}
                />
              ))
            )}
          </div>
        </section>

        {/* Priority 3: General Elective Catalog */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Recommended Electives</h2>
            <button className={styles.btnLink}>Browse Catalog</button>
          </div>
          <div className={styles.coursesGrid}>
            {coursesLoading ? (
              <p>Loading electives...</p>
            ) : coursesError ? (
              <p>{coursesError}</p>
            ) : (
              courses
                .filter(c => c.subdivision_owner !== userSubdivision && !c.is_cross_subdivision)
                .slice(0, 3)
                .map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    subdivision={course.subdivision_owner}
                    duration={formatDuration(course.duration_in_minutes)}
                    isMandatory={course.is_mandatory}
                  />
                ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
