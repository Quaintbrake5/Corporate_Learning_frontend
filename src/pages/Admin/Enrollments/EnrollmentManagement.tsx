import React, { useState, useEffect } from 'react';
import { getCourses } from '../../../services/courseService';
import adminService from '../../../services/adminService';
import type { AdminUser } from '../../../services/adminService';
import type { Course } from '../../../services/courseService';
import { parseErrorMessage } from '../../../utils/errorUtils';
import Modal from '../../../components/ui/Modal';
import styles from './EnrollmentManagement.module.css';

interface AdminEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  user_name: string;
  user_email: string;
  user_department: string;
  progress_percentage: number;
  created_at: string;
}

const EnrollmentManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const coursesData = await getCourses(1, 100);
      setCourses(coursesData.items);
      const usersData = await adminService.getUsers(1, 1000); // Fetch all users for picking
      setAllUsers(usersData.items);
      if (coursesData.items.length > 0) {
        setSelectedCourseId(coursesData.items[0].id);
      }
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Failed to load courses or users'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId: string) => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getEnrollments(1, 100, undefined, courseId);
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
    if (selectedCourseId) {
      fetchEnrollments(selectedCourseId);
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Course Enrollments</h2>
        <p>Assign and manage user access to technical paths.</p>
      </div>

      <div className={styles.courseSelection}>
        <div className={styles.selectGroup}>
          <label htmlFor="course-select" className={styles.selectLabel}>Select Course to Manage</label>
          <select 
            id="course-select"
            className={styles.select}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.enrollmentSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Enrolled Users</h3>
          <button 
            className={styles.addUserBtn}
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedCourseId}
          >
            <i className="fa-solid fa-user-plus"></i> Enroll User
          </button>
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
                <th>Status</th>
                <th>Enrolled On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.user_name}</strong></td>
                  <td>{e.user_email}</td>
                  <td>{e.user_department}</td>
                  <td>{e.progress_percentage}% Done</td>
                  <td>{new Date(e.created_at).toLocaleDateString()}</td>
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
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>No users enrolled in this course yet.</td>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.userList}>
            {allUsers
              .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
