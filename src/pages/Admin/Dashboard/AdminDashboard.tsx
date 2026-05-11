import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import type { AdminUser, Enrollment } from '../../../services/adminService';
import { getCourses } from '../../../services/courseService';
import type { Course } from '../../../services/courseService';
import Calendar from '../../../components/ui/Calendar';
import EventModal from '../../../components/ui/EventModal';
import { type Event } from '../../../services/eventService';
import { parseErrorMessage } from '../../../utils/errorUtils';
import styles from './AdminDashboard.module.css';
import { useAppSelector } from '../../../store/hooks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersResponse, coursesData] = await Promise.all([
        adminService.getUsers(1, 100),
        getCourses(1, 100)
      ]);
      const enrollmentResponse = await adminService.getEnrollments(1, 500);
      setUsers((usersResponse as unknown as { items: AdminUser[] }).items || (Array.isArray(usersResponse) ? usersResponse : []));
      setCourses(coursesData?.items || (Array.isArray(coursesData) ? coursesData : []));
      setEnrollments(enrollmentResponse.items || []);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar handlers
  const handleDateClick = (date: Date, events: Event[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    setIsModalOpen(true);
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

  // Analytics Data Preparation
  const verifiedUsers = users.filter(u => u.is_verified).length;
  const pendingUsers = users.length - verifiedUsers;

  const verificationData = [
    { name: 'Verified', value: verifiedUsers, fill: '#003366' },
    { name: 'Pending', value: pendingUsers, fill: '#90ee90' }
  ];

  const mandatoryCourses = courses.filter(c => c.is_mandatory).length;
  const electiveCourses = courses.length - mandatoryCourses;

  const courseTypeData = [
    { name: 'Mandatory', value: mandatoryCourses, fill: '#003366' },
    { name: 'Elective', value: electiveCourses, fill: '#90ee90' }
  ];

  const departmentMap: Record<number, string> = {
    1: 'CSS',
    2: 'CSI',
    3: 'CSD',
    4: 'CSL',
    5: 'CSE',
  };

  const usersByDepartment = users.reduce((acc, user) => {
    const sub = departmentMap[user.department_id] || 'Other';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentChartData = Object.keys(usersByDepartment).map(key => ({
    name: key,
    Users: usersByDepartment[key]
  }));

  const activeProgressEnrollments = enrollments
    .filter((enrollment) => enrollment.progress_percentage > 0 && enrollment.progress_percentage < 100)
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 10);

  const statusSummary = enrollments.reduce(
    (summary, enrollment) => {
      const status = enrollment.learning_status || 'not_started';
      summary[status] = (summary[status] || 0) + 1;
      return summary;
    },
    {} as Record<string, number>
  );

  const getStatusClass = (status?: Enrollment['learning_status']) => {
    switch (status) {
      case 'started':
        return styles.statusStarted;
      case 'paused':
        return styles.statusPaused;
      case 'finished':
        return styles.statusFinished;
      case 'not_completed':
        return styles.statusNotCompleted;
      default:
        return styles.statusNotStarted;
    }
  };

  const getStatusLabel = (status?: Enrollment['learning_status']) => {
    switch (status) {
      case 'started':
        return 'Started';
      case 'paused':
        return 'Paused';
      case 'finished':
        return 'Finished';
      case 'not_completed':
        return 'Not Completed';
      default:
        return 'Not Started';
    }
  };

  const getCourseTitle = (courseId: string) => {
    return courses.find((course) => course.id === courseId)?.title ?? 'Unknown Course';
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <div className={styles.welcomeCard}>
          <h1>Welcome back, {user?.name}</h1>
          <p>Here is the analytical overview of your platform.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/users')}>
            <i className="fa-solid fa-users"></i> Manage Users
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/admin/courses')}>
            <i className="fa-solid fa-video"></i> Manage Courses
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-user-check"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Total Users</span>
            <span className={styles.statValue}>{loading ? '...' : users.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-film"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Video Courses</span>
            <span className={styles.statValue}>{loading ? '...' : courses.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-person-running"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Users In Progress</span>
            <span className={styles.statValue}>{loading ? '...' : activeProgressEnrollments.length}</span>
          </div>
        </div>
      </div>

      {!loading && (
        <div className={styles.progressSection}>
          <div className={styles.sectionHeader}>
            <h3>Learner Progress Tracking</h3>
            <button className={styles.viewAllBtn} onClick={() => navigate('/admin/enrollments')}>
              View All Enrollments
            </button>
          </div>

          <div className={styles.progressSummary}>
            <span className={styles.summaryItem}>Not Started: {statusSummary.not_started || 0}</span>
            <span className={styles.summaryItem}>Started: {statusSummary.started || 0}</span>
            <span className={styles.summaryItem}>Paused: {statusSummary.paused || 0}</span>
            <span className={styles.summaryItem}>Finished: {statusSummary.finished || 0}</span>
            <span className={styles.summaryItem}>Not Completed: {statusSummary.not_completed || 0}</span>
          </div>

          <div className={styles.progressTableWrapper}>
            <table className={styles.progressTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {activeProgressEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <strong>{enrollment.user_name || 'Unknown User'}</strong>
                      <br />
                      <small>{enrollment.user_email || 'No email'}</small>
                    </td>
                    <td>{getCourseTitle(enrollment.course_id)}</td>
                    <td>{Math.round(enrollment.progress_percentage)}%</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(enrollment.learning_status)}`}>
                        {getStatusLabel(enrollment.learning_status)}
                      </span>
                    </td>
                    <td>{enrollment.last_activity_at ? new Date(enrollment.last_activity_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {activeProgressEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyProgress}>
                      No users are currently in active progress.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <i className="fa-solid fa-circle-notch fa-spin fa-3x"></i>
          <p>Analyzing platform data...</p>
        </div>
      ) : (
        <div className={styles.chartsGrid}>
          {/* User Verification Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>User Verification Status</h3>
            </div>
            <div className={styles.chartWrapper} style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e0e0e0', color: '#333' }} 
                    itemStyle={{ color: '#003366' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Distribution Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Course Types</h3>
            </div>
            <div className={styles.chartWrapper} style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={courseTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e0e0e0', color: '#333' }} 
                    itemStyle={{ color: '#003366' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users by Department Bar Chart */}
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <div className={styles.chartHeader}>
              <h3>Users by Department</h3>
            </div>
            <div className={styles.chartWrapper} style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={departmentChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 51, 102, 0.05)' }} 
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e0e0e0', color: '#333' }} 
                  />
                  <Bar dataKey="Users" fill="#003366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.sectionHeader}>
          <h3>Event Calendar</h3>
          <div className={styles.calendarLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.userLegend}`}></span>
              {" "}Personal
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.adminLegend}`}></span>
              {" "}Organization
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
      </div>

      {/* Event Modal */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedDate={selectedDate}
        events={selectedEvents}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default AdminDashboard;
