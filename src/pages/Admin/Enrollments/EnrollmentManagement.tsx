import React, { useState, useEffect } from 'react';
import { getCourses } from '../../../services/courseService';
import adminService from '../../../services/adminService';
import type { AdminUser, Enrollment } from '../../../services/adminService';
import type { Course } from '../../../services/courseService';
import { parseErrorMessage } from '../../../utils/errorUtils';
import Modal from '../../../components/ui/Modal';
import styles from './EnrollmentManagement.module.css';

interface AdminEnrollment extends Enrollment {
  user_name: string;
  user_email: string;
  user_department: string;
}

const EnrollmentManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'started' | 'paused' | 'finished' | 'not_completed'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const coursesData = await getCourses(1, 100);
      setCourses(coursesData.items);
      const usersData = await adminService.getUsers(1, 1000); // Fetch all users for picking
      setAllUsers(usersData.items);
      setSelectedCourseId(''); // Default: view all courses
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to load courses or users'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getEnrollments(1, 500, undefined, courseId || undefined);
      setEnrollments((data.items as unknown as AdminEnrollment[]) || []);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to load current enrollments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchEnrollments(selectedCourseId);
  }, [selectedCourseId]);

  const handleEnrollUser = async (userId: string) => {
    try {
      setError(null);
      await adminService.createEnrollment({
        user_id: userId,
        course_id: selectedCourseId
      });
      setIsModalOpen(false);
      fetchEnrollments(selectedCourseId);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to enroll user'));
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!globalThis.confirm('Are you sure you want to remove this user from the course?')) return;
    
    try {
      setError(null);
      await adminService.deleteEnrollment(enrollmentId);
      fetchEnrollments(selectedCourseId);
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to remove enrollment'));
    }
  };

  const enrolledUserIds = new Set(enrollments.map(e => e.user_id));

  const courseTitleById = courses.reduce((acc, course) => {
    acc[course.id] = course.title;
    return acc;
  }, {} as Record<string, string>);

  const getLearningStatusLabel = (status?: AdminEnrollment['learning_status']) => {
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

  const getLearningStatusClass = (status?: AdminEnrollment['learning_status']) => {
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

  const filteredEnrollments = enrollments
    .filter((enrollment) => {
      if (statusFilter === 'all') return true;
      return (enrollment.learning_status || 'not_started') === statusFilter;
    })
    .filter((enrollment) => {
      if (!enrollmentSearchQuery.trim()) return true;
      const q = enrollmentSearchQuery.toLowerCase();
      const courseTitle = courseTitleById[enrollment.course_id] || '';
      return (
        enrollment.user_name?.toLowerCase().includes(q) ||
        enrollment.user_email?.toLowerCase().includes(q) ||
        enrollment.user_department?.toLowerCase().includes(q) ||
        courseTitle.toLowerCase().includes(q)
      );
    });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Course Enrollments</h2>
        <p>Assign and manage user access to technical paths.</p>
      </div>

      <div className={styles.courseSelection}>
        <div className={styles.filtersRow}>
          <div className={styles.selectGroup}>
            <label htmlFor="course-select" className={styles.selectLabel}>Course Filter</label>
            <select 
              id="course-select"
              className={styles.select}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label htmlFor="status-filter" className={styles.selectLabel}>Status Filter</label>
            <select
              id="status-filter"
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="started">Started</option>
              <option value="paused">Paused</option>
              <option value="finished">Finished</option>
              <option value="not_completed">Not Completed</option>
            </select>
          </div>

          <div className={styles.searchGroup}>
            <label htmlFor="enrollment-search" className={styles.selectLabel}>Search</label>
            <input
              id="enrollment-search"
              type="text"
              className={styles.searchInput}
              placeholder="Search user, email, department, course..."
              value={enrollmentSearchQuery}
              onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.enrollmentSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Enrolled Users</h3>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshBtn}
              onClick={() => fetchEnrollments(selectedCourseId)}
              disabled={loading}
              title="Refresh list"
            >
              <i className="fa-solid fa-rotate-right"></i> Refresh
            </button>
            <button 
              className={styles.addUserBtn}
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedCourseId}
              title={!selectedCourseId ? 'Select a specific course to enroll users' : 'Enroll a user'}
            >
              <i className="fa-solid fa-user-plus"></i> Enroll User
            </button>
          </div>
        </div>

        {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem', background: '#fff0f0', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
            <p>Processing...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Course</th>
                <th>Status</th>
                <th>Enrolled On</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.user_name}</strong></td>
                  <td>{e.user_email}</td>
                  <td>{e.user_department}</td>
                  <td>{courseTitleById[e.course_id] || 'Unknown Course'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getLearningStatusClass(e.learning_status)}`}>
                      {getLearningStatusLabel(e.learning_status)}
                    </span>
                    <br />
                    <small>{e.progress_percentage}% done</small>
                  </td>
                  <td>{new Date(e.start_date).toLocaleDateString()}</td>
                  <td>{e.last_activity_at ? new Date(e.last_activity_at).toLocaleString() : '—'}</td>
                  <td>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => handleUnenroll(e.id)}
                      title="Remove User"
                    >
                      <i className="fa-solid fa-user-minus"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEnrollments.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>No enrollments match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll User to Course"
        width="500px"
      >
        <div className={styles.userPicker}>
          <input 
            type="text" 
            className={styles.searchBox}
            placeholder="Search all users..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
          <div className={styles.userList}>
            {allUsers
              .filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
              .filter(u => !enrolledUserIds.has(u.id))
              .map(u => (
                <button 
                  key={u.id} 
                  className={styles.userOption} 
                  onClick={() => handleEnrollUser(u.id)}
                  style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%', padding: '0.75rem', cursor: 'pointer' }}
                >
                  <span className={styles.userOptionName}>{u.name}</span>
                  <span className={styles.userOptionEmail}>{u.email}</span>
                </button>
              ))
            }
            {allUsers.length === 0 && <p style={{ padding: '1rem', textAlign: 'center' }}>No users available.</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentManagement;
