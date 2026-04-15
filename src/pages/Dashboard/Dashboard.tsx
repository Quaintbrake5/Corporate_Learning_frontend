import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AlertBanner from '../../components/ui/AlertBanner';
import StatCard from '../../components/ui/StatCard';
import AnalyticsPlaceholder from '../../components/ui/AnalyticsPlaceholder';
import CourseCard from '../../components/ui/CourseCard';
import { useAppSelector } from '../../store/hooks';
import { getCourses, type Course } from '../../services/courseService';
import { getSubdivision, type Subdivision } from '../../services/userService';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import styles from './Dashboard.module.css';

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
  const [subdivision, setSubdivision] = useState<Subdivision | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [courseDataResponse, subData, statsData] = await Promise.all([
          getCourses(1, 40),
          getSubdivision(),
          getDashboardStats()
        ]);
        
        const courseData = Array.isArray(courseDataResponse) ? courseDataResponse : (courseDataResponse?.items || []);
        setCourses(courseData);
        setSubdivision(subData);
        setStats(statsData);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const subdivisionName = subdivision?.name || 'Your Division';

   const learningPathCourses = courses
     .filter(c => subdivision?.id !== undefined && (Number(c.subdivision_owner) === subdivision.id || c.is_cross_subdivision))
     .slice(0, 6);

   const recommendedElectives = courses
     .filter(c => subdivision?.id !== undefined && Number(c.subdivision_owner) !== subdivision.id && !c.is_cross_subdivision)
     .slice(0, 3);

  const renderCourses = (courseList: Course[]) => {
    if (isLoading) return <p className={styles.loadingText}>Loading courses...</p>;
    if (error) return <p className={styles.errorText}>Data unavailable</p>;
    if (courseList.length === 0) return <p className={styles.emptyText}>No courses available right now.</p>;
    
    return courseList.map(course => (
      <CourseCard
        key={course.id}
        id={course.id}
        title={course.title}
        subdivision={course.subdivision_owner}
        duration={formatDuration(course.duration_in_minutes)}
        isMandatory={course.is_mandatory}
        thumbnailUrl={course.thumbnail_url}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className={styles.dashboardContainer}>
        
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Hello, {user?.name.split(' ')[0]}!</h1>
            <p className={styles.subtitle}>Let's check your progress.</p>
          </div>
        </div>

        {/* Priority 1: Overdue Mandatory Training */}
        {stats?.overdue_courses && stats.overdue_courses.length > 0 && (
          <section className={styles.dashboardSection}>
            {stats.overdue_courses.map(course => (
              <AlertBanner
                key={course.course_id}
                title="Mandatory Training Overdue"
                message={`Your '${course.title}' course was due on ${new Date(course.deadline_date).toLocaleDateString()}. Please complete it immediately to restore compliance.`}
                type="danger"
                actionText="Start Course"
              />
            ))}
          </section>
        )}

        {/* Analytics / Progress Section */}
        <section className={`${styles.dashboardSection} ${styles.analyticsGrid}`}>
          <div className={styles.statsColumn}>
             <StatCard
               title="Training Completion"
               value={isLoading ? "..." : `${stats?.training_completion_percentage ?? 0}%`}
               iconClass="fa-solid fa-graduation-cap"
               trend={{ value: 2.5, isPositive: true }}
             />
             <StatCard
               title="Learning Hours"
               value={isLoading ? "..." : `${stats?.learning_hours ?? 0}h`}
               iconClass="fa-solid fa-stopwatch"
             />
          </div>
          <div className={styles.chartsColumn}>
            <AnalyticsPlaceholder title="Working Productivity" type="line" height="230px" />
          </div>
        </section>

        {/* Priority 2: Subdivision-specific Learning Path */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Schedule: {subdivisionName}</h2>
            <button className={styles.btnLink}>View All</button>
          </div>
          <div className={styles.coursesGrid}>
            {renderCourses(learningPathCourses)}
          </div>
        </section>

        {/* Priority 3: General Elective Catalog */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recommended Classes</h2>
            <button className={styles.btnLink}>Browse Catalog</button>
          </div>
          <div className={styles.coursesGrid}>
            {renderCourses(recommendedElectives)}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
