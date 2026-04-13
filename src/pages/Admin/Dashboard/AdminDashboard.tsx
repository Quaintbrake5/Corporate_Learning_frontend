import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import type { JobStatus } from '../../../services/adminService';
import styles from './AdminDashboard.module.css';
import { useAppSelector } from '../../../store/hooks';

const AdminDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [stats, setStats] = useState({ users: 0, courses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsData, usersData, coursesData] = await Promise.all([
        adminService.getJobStatus(),
        adminService.getUsers(1, 1),
        import('../../../services/courseService').then(m => m.getCourses(1, 1))
      ]);
      setJobs(jobsData);
      setStats({
        users: usersData.total,
        courses: coursesData.total
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return 'Not scheduled';
    return new Date(isoStr).toLocaleString();
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h1>Welcome back, {user?.name}</h1>
        <p>Here is what is happening with your learning platform today.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Total Users</span>
            <span className={styles.statValue}>{loading ? '...' : stats.users}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-book"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>All Technical Courses</span>
            <span className={styles.statValue}>{loading ? '...' : stats.courses}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="fa-solid fa-check-double"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Active Jobs</span>
            <span className={styles.statValue}>{loading ? '...' : jobs.filter(j => j.status === 'scheduled').length}</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3><i className="fa-solid fa-server"></i> System Background Jobs</h3>
          <button className={styles.refreshBtn} onClick={fetchJobs} disabled={loading}>
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> Refresh
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.jobsList}>
          {jobs.length === 0 && !loading && !error && (
            <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>No background jobs found.</p>
          )}
          {jobs.map((job) => (
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobMain}>
                <div className={styles.jobIcon}>
                  <i className="fa-solid fa-gear"></i>
                </div>
                <div className={styles.jobDetails}>
                  <h4>{job.name}</h4>
                  <p>Next run: {formatDate(job.next_run_time)}</p>
                </div>
              </div>
              <div className={[styles.jobStatus, styles['status_' + job.status]].join(' ')}>
                {job.status === 'scheduled' ? (
                  <><i className="fa-solid fa-clock"></i> Scheduled</>
                ) : (
                  <><i className="fa-solid fa-pause"></i> Paused</>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
