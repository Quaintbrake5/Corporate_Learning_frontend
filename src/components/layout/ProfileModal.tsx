import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser } from '../../store/authSlice';
import { getUserProfile, getDepartment } from '../../services/userService';
import type { UserProfile, Department } from '../../services/userService';
import api from '../../services/api';
import Modal from '../ui/Modal';
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DivisionOption {
  id: number;
  code: string;
  name: string | null;
}

interface DepartmentOption {
  id: number;
  name: string;
  division_id: number;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [divisionsLoading, setDivisionsLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: '',
    department: '',
  });
  
  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDivisionChangeModal, setShowDivisionChangeModal] = useState(false);
  const [selectedDivisionForChange, setSelectedDivisionForChange] = useState<number | null>(null);
  const [selectedDepartmentForChange, setSelectedDepartmentForChange] = useState<number | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation messages
  const VALIDATION_MESSAGES = {
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Email must be valid',
    phoneRequired: 'Phone is required',
    phoneInvalid: 'Phone must be valid',
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [profileData, departmentData, divisionsData] = await Promise.all([
          getUserProfile(),
          getDepartment(),
          api.get<DivisionOption[]>('/divisions')
        ]);
        
        setProfile(profileData);
        setDepartment(departmentData);
        setDivisions(divisionsData.data);
        
        // Initialize form data
        setFormData({
          name: profileData.name,
          email: profileData.email,
          phone: '', // Phone field doesn't exist in UserProfile, defaulting to empty string
          division: String(profileData.department_id),
          department: String(departmentData.id),
        });
        
        // Load departments for the user's division
        // In a real app, we would fetch departments for the selected division
        // For now, we'll simulate by setting an empty array
        setDepartments([]);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load profile data';
        setApiError(message);
      } finally {
        setLoading(false);
        setDivisionsLoading(false);
        setDepartmentsLoading(false);
      }
    };
    
    if (user) {
      loadProfileData();
    }
  }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      // Trim whitespace for select values as it's usually not meaningful
      setFormData(prev => ({
        ...prev,
        [name]: value.trim()
      }));
      
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };

   const validateForm = (): boolean => {
     const errors: Record<string, string> = {};
     
     if (!formData.name.trim()) {
       errors.name = VALIDATION_MESSAGES.nameRequired;
     }
     
     if (!formData.email.trim()) {
       errors.email = VALIDATION_MESSAGES.emailRequired;
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       errors.email = VALIDATION_MESSAGES.emailInvalid;
     }
     
     if (!formData.phone.trim()) {
       errors.phone = VALIDATION_MESSAGES.phoneRequired;
     } else if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
       errors.phone = VALIDATION_MESSAGES.phoneInvalid;
     }
     
     // Validate division
     if (!formData.division) {
       errors.division = 'Division is required';
     }
     
     // Validate department
     if (!formData.department) {
       errors.department = 'Department is required';
     }
     
     setFormErrors(errors);
     return Object.keys(errors).length === 0;
   };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setApiError(null);
      
      // Update user profile via API
      await api.put('/users/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department_id: Number(formData.department)
      });
      
      // Update Redux store
      dispatch(updateUser({
        ...user!,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department_id: Number(formData.department)
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile && department) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        division: String(profile.department_id),
        department: String(department.id),
      });
    }
    setIsEditMode(false);
    setFormErrors({});
  };

  const openDivisionChangeModal = () => {
    setSelectedDivisionForChange(null);
    setSelectedDepartmentForChange(null);
    setChangeError(null);
    setChangeSuccess(null);
    setShowDivisionChangeModal(true);
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divisionId = Number(e.target.value);
    setSelectedDivisionForChange(divisionId);
    setSelectedDepartmentForChange(null);
    
    // Load departments for selected division
    const selectedDivision = divisions.find(d => d.id === divisionId);
    if (selectedDivision) {
      // In a real app, we'd fetch departments for this division
      // For now, we'll use the departments from the division data if available
      // Since we don't have that data readily available, we'll simulate it
      setDepartmentsLoading(true);
      // This would normally be an API call like: api.get(`/divisions/${divisionId}/departments`)
      // For demo purposes, we'll use a timeout to simulate loading
      setTimeout(() => {
        // In a real implementation, this would come from the API
        setDepartmentsLoading(false);
      }, 500);
    } else {
      setDepartments([]);
      setDepartmentsLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartmentForChange(Number(e.target.value));
  };

  const handleConfirmDivisionChange = async () => {
    if (!selectedDivisionForChange || !selectedDepartmentForChange) return;
    
    try {
      setChangeLoading(true);
      setChangeError(null);
      setChangeSuccess(null);
      
      // Update user's department/department
      await api.put('/users/profile', {
        department_id: selectedDepartmentForChange
      });
      
      // Update Redux store
      dispatch(updateUser({
        ...user!,
        department_id: selectedDepartmentForChange
      }));
      
      // Update local state
      setChangeSuccess('Division/Department updated successfully!');
      
      // Refresh profile data after successful change
      setTimeout(async () => {
        const [profileData, departmentData] = await Promise.all([
          getUserProfile(),
          getDepartment()
        ]);
        setProfile(profileData);
        setDepartment(departmentData);
        setFormData(prev => ({
          ...prev,
          division: String(profileData.department_id),
          department: String(departmentData.id)
        }));
        
        // Close the division change modal after a brief delay
        setTimeout(() => {
          setShowDivisionChangeModal(false);
        }, 1500);
      }, 1000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update division/department';
      setChangeError(message);
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <>
      {/* Main Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} title="User Profile" width="500px">
        {loading && <div className={styles.loading}>Loading profile data...</div>}
        
         {!loading && profile && department && (
           <>
              <div className={styles.profileSection}>
                {isEditMode ? (
                  <form className={styles.editMode} onSubmit={e => e.preventDefault()}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="name-input">Name</label>
                      <input
                        id="name-input"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`${styles.formInput} ${formErrors.name ? styles.inputError : ''}`}
                      />
                      {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
                    </div>
                   
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="email-input">Email</label>
                       <input
                         id="email-input"
                         type="email"
                         name="email"
                         value={formData.email}
                         onChange={handleInputChange}
                         className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                       />
                      {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
                    </div>
                   
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="phone-input">Phone</label>
                       <input
                         id="phone-input"
                         type="tel"
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         className={`${styles.formInput} ${formErrors.phone ? styles.inputError : ''}`}
                       />
                      {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                    </div>
                   
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="division-select">Division</label>
                      <select
                        id="division-select"
                        name="division"
                        value={formData.division}
                        onChange={handleSelectChange}
                        className={`${styles.formSelect} ${formErrors.division ? styles.inputError : ''}`}
                        disabled={divisionsLoading}
                      >
                        <option value="">Select Division</option>
                        {divisions.map(div => (
                          <option key={div.id} value={String(div.id)}>
                            {div.name || div.code}
                          </option>
                        ))}
                      </select>
                      {formErrors.division && <span className={styles.errorText}>{formErrors.division}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="department-select">Department</label>
                      <select
                        id="department-select"
                        name="department"
                        value={formData.department}
                        onChange={handleSelectChange}
                        className={styles.formSelect}
                        disabled={!formData.division || departmentsLoading}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {departmentsLoading && formData.division && (
                        <p className={styles.loadingText}>Loading departments...</p>
                      )}
                      {!formData.division && (
                        <p className={styles.hintText}>Please select a division first</p>
                      )}
                      {formData.division && departments.length === 0 && !departmentsLoading && (
                        <p className={styles.hintText}>No departments available for selected division</p>
                      )}
                      {formErrors.department && <span className={styles.errorText}>{formErrors.department}</span>}
                    </div>
                   
                    <div className={styles.formActions}>
                      <button 
                        type="button" 
                        className={styles.cancelButton} 
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      
                      <button 
                        type="submit" 
                        className={styles.saveButton} 
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.viewMode}>
                    <div className={styles.infoGroup}>
                      <div className={styles.infoLabel}>Name</div>
                      <div className={styles.infoValue}>{profile.name}</div>
                    </div>
                    
                    <div className={styles.infoGroup}>
                      <div className={styles.infoLabel}>Email</div>
                      <div className={styles.infoValue}>{profile.email}</div>
                    </div>
                    
                    <div className={styles.infoGroup}>
                      <div className={styles.infoLabel}>Phone</div>
                      <div className={styles.infoValue}>{profile.phone || 'Not provided'}</div>
                    </div>
                    
                    <div className={styles.infoGroup}>
                      <div className={styles.infoLabel}>Division</div>
                      <div className={styles.infoValue}>
                        {department.name}
                      </div>
                    </div>
                    
                    <div className={styles.infoGroup}>
                      <div className={styles.infoLabel}>Department</div>
                      <div className={styles.infoValue}>
                        {department.name}
                      </div>
                    </div>
                    
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.editButton} 
                        onClick={handleEdit}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit Profile
                      </button>
                      
                      <button 
                        className={styles.changeDivisionButton} 
                        onClick={openDivisionChangeModal}
                      >
                        Request Division/Department Change
                      </button>
                    </div>
                  </div>
                )}
            </div>
            
             {apiError && (
               <div className={`${styles.alert} ${styles.alertError}`}>
                 <FontAwesomeIcon icon={faExclamationTriangle} />
                 <span>{apiError}</span>
               </div>
             )}
             
             {successMessage && (
               <div className={`${styles.alert} ${styles.alertSuccess}`}>
                 <FontAwesomeIcon icon={faSave} />
                 <span>{successMessage}</span>
               </div>
             )}
          </>
        )}
      </Modal>
      
      {/* Division/Department Change Confirmation Modal */}
      <Modal 
        isOpen={showDivisionChangeModal} 
        onClose={() => setShowDivisionChangeModal(false)} 
        title="Change Division/Department"
        width="450px"
      >
        <div className={styles.changeWarning}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
          <div className={styles.warningMessage}>
            <p>Warning: Changing your division/department may affect your access to certain courses, workflows, and system permissions.</p>
            <p>Please ensure you have obtained the necessary approvals before proceeding with this change.</p>
          </div>
        </div>
        
            {changeError && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{changeError}</span>
              </div>
            )}
            
            {changeSuccess && (
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                <FontAwesomeIcon icon={faSave} />
                <span>{changeSuccess}</span>
              </div>
            )}
        
        {!changeLoading && !changeError && !changeSuccess && (
          <>
             <div className={styles.formGroup}>
               <label className={styles.formLabel} htmlFor="new-division-select">New Division</label>
               <select
                 id="new-division-select"
                 value={selectedDivisionForChange || ''}
                 onChange={handleDivisionChange}
                 className={styles.formSelect}
                 disabled={divisionsLoading}
               >
                <option value="">Select Division</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.name || div.code}
                  </option>
                ))}
              </select>
            </div>
            
             <div className={styles.formGroup}>
               <label className={styles.formLabel} htmlFor="new-department-select">New Department</label>
               <select
                 id="new-department-select"
                 value={selectedDepartmentForChange || ''}
                 onChange={handleDepartmentChange}
                 className={styles.formSelect}
                 disabled={!selectedDivisionForChange || departmentsLoading}
               >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departmentsLoading && selectedDivisionForChange && (
                <p className={styles.loadingText}>Loading departments...</p>
              )}
              {!selectedDivisionForChange && (
                <p className={styles.hintText}>Please select a division first</p>
              )}
              {selectedDivisionForChange && departments.length === 0 && !departmentsLoading && (
                <p className={styles.hintText}>No departments available for selected division</p>
              )}
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={() => setShowDivisionChangeModal(false)}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                className={styles.confirmButton} 
                onClick={handleConfirmDivisionChange}
                disabled={changeLoading || !selectedDivisionForChange || !selectedDepartmentForChange}
              >
                {changeLoading ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ProfileModal;