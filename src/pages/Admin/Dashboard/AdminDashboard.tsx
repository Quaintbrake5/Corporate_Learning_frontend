import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import type { AdminUser } from '../../../services/adminService';
import { getCourses } from '../../../services/courseService';
import type { Course } from '../../../services/courseService';
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
  Cell,
  Legend
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, coursesData] = await Promise.all([
        adminService.getUsers(1, 100),
        getCourses(1, 100)
      ]);
      setUsers((usersData as any).users || (Array.isArray(usersData) ? usersData : []));
      setCourses(coursesData?.items || (Array.isArray(coursesData) ? coursesData : []));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Analytics Data Preparation
  const verifiedUsers = users.filter(u => u.is_verified).length;
  const pendingUsers = users.length - verifiedUsers;

  const verificationData = [
    { name: 'Verified', value: verifiedUsers },
    { name: 'Pending', value: pendingUsers }
  ];

  const mandatoryCourses = courses.filter(c => c.is_mandatory).length;
  const electiveCourses = courses.length - mandatoryCourses;

  const courseTypeData = [
    { name: 'Mandatory', value: mandatoryCourses },
    { name: 'Elective', value: electiveCourses }
  ];

  const subdivisionMap: Record<number, string> = {
    1: 'CSS',
    2: 'CSI',
    3: 'CSD',
    4: 'CSL',
    5: 'CSE',
  };

  const usersBySubdivision = users.reduce((acc, user) => {
    const sub = subdivisionMap[user.subdivision_id] || 'Other';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subdivisionChartData = Object.keys(usersBySubdivision).map(key => ({
    name: key,
    Users: usersBySubdivision[key]
  }));

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
      </div>

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
            <div className={styles.chartWrapper}>
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
                  >
                    <Cell fill="#003366" />
                    <Cell fill="#90ee90" />
                  </Pie>
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
            <div className={styles.chartWrapper}>
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
                  >
                    <Cell fill="#003366" />
                    <Cell fill="#90ee90" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderColor: '#e0e0e0', color: '#333' }} 
                    itemStyle={{ color: '#003366' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users by Subdivision Bar Chart */}
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <div className={styles.chartHeader}>
              <h3>Users by Subdivision</h3>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={subdivisionChartData}
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
    </div>
  );
};

export default AdminDashboard;
