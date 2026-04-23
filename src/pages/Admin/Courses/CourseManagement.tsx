import React, { useEffect, useState } from 'react';
import { getCourses } from '../../../services/courseService';
import type { Course } from '../../../services/courseService';
import adminService from '../../../services/adminService';
import Modal from '../../../components/ui/Modal';
import CourseForm from './CourseForm';
import ModuleManager from './ModuleManager';
import styles from './CourseManagement.module.css';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false);
  const [moduleCourseId, setModuleCourseId] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses(1, 100) as any;
      setCourses(data?.items || (Array.isArray(data) ? data : []));
    } catch (err: unknown) {
      let message = 'Failed to load courses';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleManageModules = (courseId: string) => {
    setModuleCourseId(courseId);
    setIsModuleManagerOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (!globalThis.confirm(`Are you sure you want to delete course "${course.title}"? This will also remove any associated modules.`)) {
      return;
    }

    try {
      setError(null);
      await adminService.deleteCourse(course.id);
      setCourses(courses.filter(c => c.id !== course.id));
    } catch (err: unknown) {
      let message = 'Failed to delete course';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchCourses();
  };

  const getDepartmentName = (id: string | number) => {
    const parsedId = typeof id === 'string' ? Number.parseInt(id, 10) : id;
    const map: Record<number, string> = {
      1: 'CSS (Security)',
      2: 'CSI (IMT/IT)',
      3: 'CSD (Digital)',
      4: 'CSL (Logistics)',
      5: 'CSE (Estates)',
    };
    return map[parsedId] || `Unknown (${id})`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Course Management</h2>
        <button className={styles.addButton} onClick={handleAdd}>
          <i className="fa-solid fa-folder-plus"></i> Create Course
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
          <p>Loading courses...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Duration (mins)</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <strong>{course.title}</strong>
                  </td>
                  <td>{getDepartmentName(course.department_owner)}</td>
                  <td>{course.duration_in_minutes}</td>
                  <td>
                    {course.is_mandatory ? (
                      <span className={styles.mandatoryBadge}>Mandatory</span>
                    ) : (
                      <span className={styles.electiveBadge}>Elective</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`${styles.actionButton} ${styles.modulesButton}`} 
                        title="Manage Modules"
                        onClick={() => handleManageModules(course.id)}
                      >
                        <i className="fa-solid fa-layer-group"></i>
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton}`} 
                        title="Edit Course"
                        onClick={() => handleEdit(course)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`} 
                        title="Delete Course"
                        onClick={() => handleDelete(course)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Create New Course'}
        width="600px"
      >
        <CourseForm
          course={selectedCourse}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Module Manager Modal */}
      <Modal
        isOpen={isModuleManagerOpen}
        onClose={() => setIsModuleManagerOpen(false)}
        title="Manage Content Modules"
        width="700px"
      >
        {moduleCourseId && <ModuleManager courseId={moduleCourseId} />}
      </Modal>
    </div>
  );
};

export default CourseManagement;
