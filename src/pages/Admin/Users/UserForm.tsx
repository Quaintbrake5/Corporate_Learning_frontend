import React, { useState, useEffect } from 'react';
import adminService, { type AdminUser, type AdminCreateUserData, type AdminUpdateUserData } from '../../../services/adminService';
import styles from './UserForm.module.css';

interface UserFormProps {
  user: AdminUser | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department_id: 1,
    role: 'learner',
    is_verified: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Password is never sent back from API
        department_id: user.department_id,
        role: user.role,
        is_verified: user.is_verified
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'department_id' ? Number.parseInt(value, 10) : val
    }));
  };

   const handleSubmit = async (e: React.SyntheticEvent) => {
     e.preventDefault();
     setLoading(true);
     setError(null);
 
     try {
        if (user) {
          // Update
          const updateData: AdminUpdateUserData = {
            name: formData.name,
            department_id: formData.department_id,
            role: formData.role as 'learner' | 'manager' | 'admin',
            is_verified: formData.is_verified,
            password: ''
          };
          // Only include password if it was entered
          if (formData.password) {
            updateData.password = formData.password;
          }
          await adminService.updateUser(user.id, updateData);
        } else {
          // Create
          const createData: AdminCreateUserData = {
            name: formData.name,
            email: formData.email,
            department_id: formData.department_id,
            role: formData.role as 'learner' | 'manager' | 'admin'
          };
          // Only include password if it was entered
          if (formData.password) {
            createData.password = formData.password;
          }
          await adminService.createUser(createData);
        }
       onSuccess();
     } catch (err: unknown) {
       let message = 'An error occurred while saving the user';
       if (err && typeof err === 'object' && 'response' in err) {
         const response = (err as { response: { data?: any } }).response;
         if (response?.data) {
           // Handle detail as either string or array
           if (response.data.detail) {
             if (Array.isArray(response.data.detail)) {
               // Join array elements into a single string
               message = response.data.detail.join(' ');
             } else {
               message = String(response.data.detail);
             }
           }
         }
       }
       setError(message);
     } finally {
       setLoading(false);
     }
   };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="user-fullname" className={styles.label}>Full Name</label>
        <input
          id="user-fullname"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="user-email" className={styles.label}>Email Address</label>
        <input
          id="user-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={!!user} // Email cannot be changed after creation
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="user-password" className={styles.label}>{user ? 'New Password (Optional)' : 'Password'}</label>
        <input
          id="user-password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required={!user}
          placeholder={user ? 'Leave blank to keep current password' : ''}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label htmlFor="user-department" className={styles.label}>Department</label>
          <select
            id="user-department"
            name="department_id"
            value={formData.department_id}
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
          <label htmlFor="user-role" className={styles.label}>Role</label>
          <select
            id="user-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="learner">Learner</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {user && (
        <div className={styles.formGroup}>
          <label className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span className={styles.label}>Email Verified</span>
          </label>
        </div>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
          ) : (
            'Save User'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
