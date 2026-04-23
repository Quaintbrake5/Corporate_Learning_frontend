import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AlertBanner from '../../components/ui/AlertBanner';
import StatCard from '../../components/ui/StatCard';
import ProductivityChart from '../../components/ui/ProductivityChart';
import CourseCard from '../../components/ui/CourseCard';
import Calendar from '../../components/ui/Calendar';
import EventModal from '../../components/ui/EventModal';
import { useAppSelector } from '../../store/hooks';
import { getCourses, type Course } from '../../services/courseService';
import { getDepartment, type Department } from '../../services/userService';
import { getDashboardStats, getProductivityData, type DashboardStats, type ProductivityData } from '../../services/dashboardService';
import { type Event } from '../../services/eventService';
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
  const [department, setDepartment] = useState<Department | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productivityData, setProductivityData] = useState<ProductivityData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProductivityLoading, setIsProductivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [courseDataResponse, subData, statsData] = await Promise.all([
          getCourses(1, 40),
          getDepartment(),
          getDashboardStats()
        ]);
        
        const courseData = Array.isArray(courseDataResponse) ? courseDataResponse : (courseDataResponse?.items || []);
        setCourses(courseData);
        setDepartment(subData);
        setStats(statsData);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProductivityData = async () => {
      try {
        setIsProductivityLoading(true);
        const data = await getProductivityData(30);
        setProductivityData(data);
      } catch (err) {
        console.error('Productivity data fetch error:', err);
        // Don't show error for productivity - just show empty state
        setProductivityData(null);
      } finally {
        setIsProductivityLoading(false);
      }
    };

    fetchDashboardData();
    fetchProductivityData();
  }, []);

  // Calendar handlers
  const handleDateClick = (date: Date, events: Event[]) => {
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(events);
      setIsModalOpen(true);
    }
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvents([]);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const handleEventCreated = () => {
    setCalendarRefresh(prev => prev + 1);
  };

  const departmentName = department?.name || 'Your Division';

   const learningPathCourses = courses
     .filter(c => department?.id !== undefined && (Number(c.department_owner) === department.id || c.is_cross_department))
     .slice(0, 6);

   const recommendedElectives = courses
     .filter(c => department?.id !== undefined && Number(c.department_owner) !== department.id && !c.is_cross_department)
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
        department={course.department_owner}
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
            <ProductivityChart 
              data={productivityData?.data ?? []} 
              isLoading={isProductivityLoading}
            />
          </div>
        </section>

        {/* Calendar Section */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Calendar</h2>
            <div className={styles.calendarLegend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.userLegend}`}></span>
                Personal
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.adminLegend}`}></span>
                Organization
              </span>
            </div>
          </div>
          <div className={styles.calendarWrapper}>
            <Calendar 
              onDateClick={handleDateClick}
              onAddEvent={handleAddEvent}
              refreshTrigger={calendarRefresh}
            />
          </div>
        </section>

        {/* Priority 2: Department-specific Learning Path */}
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Schedule: {departmentName}</h2>
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

        {/* Event Modal */}
        <EventModal 
          isOpen={isModalOpen}
          onClose={handleModalClose}
          selectedDate={selectedDate}
          events={selectedEvents}
          onEventCreated={handleEventCreated}
        />

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
