import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import type { Course } from '../../../services/courseService';
import styles from './CourseForm.module.css';

interface CourseFormProps {
  course: Course | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subdivision_owner: 1,
    duration_in_minutes: 60,
    is_mandatory: false,
    is_cross_subdivision: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        subdivision_owner: typeof course.subdivision_owner === 'string' ? Number.parseInt(course.subdivision_owner, 10) : course.subdivision_owner,
        duration_in_minutes: course.duration_in_minutes,
        is_mandatory: course.is_mandatory,
        is_cross_subdivision: course.is_cross_subdivision
      });
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'subdivision_owner' || name === 'duration_in_minutes' ? Number.parseInt(value, 10) : val
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        subdivision_owner: String(formData.subdivision_owner)
      };

      if (course) {
        await adminService.updateCourse(course.id, payload);
      } else {
        await adminService.createCourse(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while saving the course';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) {
          errorMessage = response.data.detail;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="course-title" className={styles.label}>Course Title</label>
        <input
          id="course-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="e.g. HSE Maritime Safety"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="course-desc" className={styles.label}>Description</label>
        <textarea
          id="course-desc"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Summarize course content and goals..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label htmlFor="course-subowner" className={styles.label}>Subdivision Owner</label>
          <select
            id="course-subowner"
            name="subdivision_owner"
            value={formData.subdivision_owner}
            onChange={handleChange}
            className={styles.select}
          >
            <option value={1}>CSS (Security)</option>
            <option value={2}>CSI (IMT/IT)</option>
            <option value={3}>CSD (Digital)</option>
            <option value={4}>CSL (Logistics)</option>
            <option value={5}>CSE (Estates)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="course-duration" className={styles.label}>Duration (minutes)</label>
          <input
            id="course-duration"
            type="number"
            name="duration_in_minutes"
            value={formData.duration_in_minutes}
            onChange={handleChange}
            className={styles.input}
            required
            min={1}
          />
        </div>
      </div>

      <div className={styles.checkboxContainer}>
        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            name="is_mandatory"
            checked={formData.is_mandatory}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <span className={styles.label}>Mandatory Certification</span>
        </label>
        
        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            name="is_cross_subdivision"
            checked={formData.is_cross_subdivision}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <span className={styles.label}>Available Across All Subdivisions</span>
        </label>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
          ) : (
            'Save Course'
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
