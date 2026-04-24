import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import type { Course } from '../../../services/courseService';
import { convertToEmbedUrl } from '../../../utils/videoUrlUtils';
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
    department_owner: 1,
    duration_in_minutes: 60,
    is_mandatory: false,
    is_cross_department: false,
    video_url: '',
    thumbnail_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        department_owner: typeof course.department_owner === 'string' ? Number.parseInt(course.department_owner, 10) : course.department_owner,
        duration_in_minutes: course.duration_in_minutes,
        is_mandatory: course.is_mandatory,
        is_cross_department: course.is_cross_department,
        video_url: '',
        thumbnail_url: course.thumbnail_url || ''
      });
    }
  }, [course]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'department_owner' || name === 'duration_in_minutes' ? 
        value === '' ? prev[name] : Number.parseInt(value, 10) : val
    }));
  };

    const handleSubmit = async (e: React.SyntheticEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const payload: Partial<Course> = {
          title: formData.title,
          description: formData.description,
          department_owner: String(formData.department_owner),
          duration_in_minutes: formData.duration_in_minutes,
          is_mandatory: formData.is_mandatory,
          is_cross_department: formData.is_cross_department,
          thumbnail_url: formData.thumbnail_url || undefined
        };

        if (course) {
          await adminService.updateCourse(course.id, payload);
        } else {
          const newCourse = await adminService.createCourse(payload);
          // Automatically create a video module if a URL is provided
          if (formData.video_url.trim() !== '') {
            await adminService.createModule(newCourse.id, {
              title: formData.title + ' - Primary Video',
              content_type: 'video',
              content_url: convertToEmbedUrl(formData.video_url, true),
              order_index: 0
            });
          }
        }
        onSuccess();
      } catch (err: unknown) {
        let errorMessage = 'An error occurred while saving the course';
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as { response: { data?: any } }).response;
          if (response?.data) {
            // Handle detail as either string, array, or validation error object
            if (response.data.detail) {
              if (Array.isArray(response.data.detail)) {
                // Join array elements into a single string
                errorMessage = response.data.detail.map((error: any) => 
                  error.msg || error.message || String(error)
                ).join(' ');
              } else if (typeof response.data.detail === 'object' && response.data.detail !== null) {
                // Handle validation error objects (like from Pydantic)
                try {
                  // Try to extract a meaningful message from the validation error
                  if ('msg' in response.data.detail) {
                    errorMessage = String(response.data.detail.msg);
                  } else if ('message' in response.data.detail) {
                    errorMessage = String(response.data.detail.message);
                  } else {
                    // Fallback to extracting common fields
                    const fields = Object.keys(response.data.detail);
                    if (fields.length > 0) {
                      errorMessage = fields.map(field => 
                        `${field}: ${String((response.data.detail as any)[field])}`
                      ).join('; ');
                    } else {
                      errorMessage = 'Validation error occurred';
                    }
                  }
                } catch (e) {
                  errorMessage = 'Validation error occurred';
                }
              } else {
                errorMessage = String(response.data.detail);
              }
            }
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

       if (course) {
         await adminService.updateCourse(course.id, payload);
       } else {
         const newCourse = await adminService.createCourse(payload);
         // Automatically create a video module if a URL is provided
         if (formData.video_url.trim() !== '') {
           await adminService.createModule(newCourse.id, {
             title: formData.title + ' - Primary Video',
             content_type: 'video',
             content_url: convertToEmbedUrl(formData.video_url, true),
             order_index: 0
           });
         }
       }
       onSuccess();
       } catch (err: unknown) {
         let errorMessage = 'An error occurred while saving the course';
         if (err && typeof err === 'object' && 'response' in err) {
           const response = (err as { response: { data?: any } }).response;
           if (response?.data) {
             // Handle detail as either string, array, or validation error object
             if (response.data.detail) {
               if (Array.isArray(response.data.detail)) {
                 // Join array elements into a single string
                 errorMessage = response.data.detail.map((error: any) => 
                   error.msg || error.message || String(error)
                 ).join(' ');
               } else if (typeof response.data.detail === 'object' && response.data.detail !== null) {
                 // Handle validation error objects (like from Pydantic)
                 try {
                   // Try to extract a meaningful message from the validation error
                   if ('msg' in response.data.detail) {
                     errorMessage = String(response.data.detail.msg);
                   } else if ('message' in response.data.detail) {
                     errorMessage = String(response.data.detail.message);
                   } else {
                     // Fallback to extracting common fields
                     const fields = Object.keys(response.data.detail);
                     if (fields.length > 0) {
                       errorMessage = fields.map(field => 
                         `${field}: ${String((response.data.detail as any)[field])}`
                       ).join('; ');
                     } else {
                       errorMessage = 'Validation error occurred';
                     }
                   }
                 } catch (e) {
                   errorMessage = 'Validation error occurred';
                 }
               } else {
                 errorMessage = String(response.data.detail);
               }
             }
           }
         }
         setError(errorMessage);
       }
                } catch (e) {
                  errorMessage = 'Validation error occurred';
                }
              } else {
                errorMessage = String(response.data.detail);
              }
            }
          }
        }
        setError(errorMessage);
     } finally {
       setLoading(false);
     }
   };

  const submitLabel = course ? 'Update Course' : 'Create Video Course';

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
          placeholder="e.g. Masterclass: Security"
        />
      </div>

      {!course && (
        <div className={styles.formGroup}>
          <label htmlFor="video-url" className={styles.label}><i className="fa-solid fa-video" style={{color: '#ffca28', marginRight: '5px'}}></i> Primary Video URL</label>
          <input
            id="video-url"
            type="text"
            name="video_url"
            value={formData.video_url}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://example.com/video.mp4"
            required={!course}
          />
        </div>
      )}

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

      <div className={styles.formGroup}>
        <label htmlFor="thumbnail-url" className={styles.label}><i className="fa-solid fa-image" style={{color: '#66bb6a', marginRight: '5px'}}></i> Thumbnail URL</label>
        <input
          id="thumbnail-url"
          type="text"
          name="thumbnail_url"
          value={formData.thumbnail_url}
          onChange={handleChange}
          className={styles.input}
          placeholder="https://example.com/thumbnail.jpg"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label htmlFor="course-subowner" className={styles.label}>Department Owner</label>
          <select
            id="course-subowner"
            name="department_owner"
            value={formData.department_owner}
            onChange={handleChange}
            className={styles.select}
          >
            <option value={1}>CSS</option>
            <option value={2}>CSI</option>
            <option value={3}>CSD</option>
            <option value={4}>CSL</option>
            <option value={5}>CSE</option>
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
            name="is_cross_department"
            checked={formData.is_cross_department}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <span className={styles.label}>Available Across All Departments</span>
        </label>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;