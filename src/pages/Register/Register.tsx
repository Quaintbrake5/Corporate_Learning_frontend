import React, { useState } from 'react';
import styles from './Register.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faKey, faPhone, faBuilding, faUserGroup, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const RegisterStep = {
  PersonalInfo: 0,
  Credentials: 1,
  DepartmentDivision: 2,
  Confirmation: 3,
} as const;

type RegisterStep = typeof RegisterStep[keyof typeof RegisterStep];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    pin: '',
    department: '',
    division: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState<RegisterStep>(RegisterStep.PersonalInfo);

  // Sample department and division data
  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'CS', label: 'Corporate Services (CS)' },
    { value: 'ENG', label: 'Engineering (ENG)' },
    { value: 'OPS', label: 'Operations (OPS)' },
    { value: 'FIN', label: 'Finance (FIN)' },
    { value: 'HR', label: 'Human Resources (HR)' },
  ];

  const divisions: Record<string, Array<{ value: string; label: string }>> = {
    CS: [
      { value: '', label: 'Select Division' },
      { value: 'CSS', label: 'Security Services (CSS)' },
      { value: 'CSI', label: 'Information Management & Technology (CSI)' },
      { value: 'CSD', label: 'Digital & Innovation (CSD)' },
      { value: 'CSL', label: 'Logistics (CSL)' },
      { value: 'CSE', label: 'Estates (CSE)' },
    ],
    ENG: [
      { value: '', label: 'Select Division' },
      { value: 'ENG1', label: 'Engineering Division 1' },
      { value: 'ENG2', label: 'Engineering Division 2' },
    ],
    OPS: [
      { value: '', label: 'Select Division' },
      { value: 'OPS1', label: 'Operations Division 1' },
      { value: 'OPS2', label: 'Operations Division 2' },
    ],
    FIN: [
      { value: '', label: 'Select Division' },
      { value: 'FIN1', label: 'Finance Division 1' },
    ],
    HR: [
      { value: '', label: 'Select Division' },
      { value: 'HR1', label: 'HR Division 1' },
    ],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? !!checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleNextStep = () => {
    if (step === RegisterStep.PersonalInfo && formData.fullName.trim() !== '' && formData.username.trim() !== '') {
      setStep(RegisterStep.Credentials);
    } else if (step === RegisterStep.Credentials && formData.password && formData.password.length >= 8) {
      setStep(RegisterStep.DepartmentDivision);
    } else if (step === RegisterStep.DepartmentDivision && formData.department && formData.division) {
      setStep(RegisterStep.Confirmation);
    }
  };

  const handleBackStep = () => {
    if (step === RegisterStep.Credentials) {
      setStep(RegisterStep.PersonalInfo);
    } else if (step === RegisterStep.DepartmentDivision) {
      setStep(RegisterStep.Credentials);
    } else if (step === RegisterStep.Confirmation) {
      setStep(RegisterStep.DepartmentDivision);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleTogglePin = () => setShowPin(!showPin);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (formData.pin && formData.pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (formData.department && !formData.division) {
      newErrors.division = 'Please select a division';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // In a real app, you would call your registration service here
        console.log('Registration successful:', formData);
        // Redirect to login page or appropriate page
        // navigate('/login');
      } catch (error) {
        // Handle error
        console.error('Registration failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <img 
            src="/assets/NLNG logo.jpg" 
            alt="NLNG Logo" 
            className={styles.registerLogo}
          />
          <h2 className={styles.registerTitle}>Create Your Account</h2>
          <p className={styles.registerSubtitle}>
            Join the NLNG Corporate Learning Platform
          </p>
        </div>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progressFill} ${step === RegisterStep.PersonalInfo && styles.active}`}
                style={{ width: '25%' }}
              ></div>
              <div 
                className={`${styles.progressFill} ${step === RegisterStep.Credentials && styles.active}`}
                style={{ width: '25%' }}
              ></div>
              <div 
                className={`${styles.progressFill} ${step === RegisterStep.DepartmentDivision && styles.active}`}
                style={{ width: '25%' }}
              ></div>
              <div 
                className={`${styles.progressFill} ${step === RegisterStep.Confirmation && styles.active}`}
                style={{ width: '25%' }}
              ></div>
            </div>
            <div className={styles.progressLabels}>
              <span className={`${styles.progressLabel} ${step === RegisterStep.PersonalInfo && styles.active}`}>1. Personal Info</span>
              <span className={`${styles.progressLabel} ${step === RegisterStep.Credentials && styles.active}`}>2. Credentials</span>
              <span className={`${styles.progressLabel} ${step === RegisterStep.DepartmentDivision && styles.active}`}>3. Department/Division</span>
              <span className={`${styles.progressLabel} ${step === RegisterStep.Confirmation && styles.active}`}>4. Confirmation</span>
            </div>
          </div>
          
          {step === RegisterStep.PersonalInfo && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faUser} className={styles.formIcon} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.fullName ? styles.inputError : ''}`}
                  placeholder="Enter your full name"
                  autoFocus
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faUser} className={styles.formIcon} />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.username ? styles.inputError : ''}`}
                  placeholder="Choose a username"
                />
                {errors.username && <span className={styles.errorText}>{errors.username}</span>}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={handleBackStep}
                  disabled={step === RegisterStep.PersonalInfo}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className={styles.nextButton}
                  onClick={handleNextStep}
                  disabled={!(formData.fullName.trim() && formData.username.trim()) || loading}
                >
                  {loading ? 'Next...' : 'Next'}
                </button>
              </div>
            </>
          )}
          
          {step === RegisterStep.Credentials && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faLock} className={styles.formIcon} />
                  Password
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleTogglePassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faKey : faLock} 
                      className={styles.toggleIcon} 
                    />
                  </button>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Create a password"
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pin" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faPhone} className={styles.formIcon} />
                  PIN (Optional)
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleTogglePin}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    <FontAwesomeIcon 
                      icon={showPin ? faKey : faPhone} 
                      className={styles.toggleIcon} 
                    />
                  </button>
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.pin ? styles.inputError : ''}`}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                />
                {errors.pin && <span className={styles.errorText}>{errors.pin}</span>}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={handleBackStep}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className={styles.nextButton}
                  onClick={handleNextStep}
                  disabled={!(formData.password && formData.password.length >= 8) || loading}
                >
                  {loading ? 'Next...' : 'Next'}
                </button>
              </div>
            </>
          )}
          
          {step === RegisterStep.DepartmentDivision && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="department" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.formIcon} />
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${styles.formSelect} ${errors.department ? styles.inputError : ''}`}
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && <span className={styles.errorText}>{errors.department}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="division" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faUserGroup} className={styles.formIcon} />
                  Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className={`${styles.formSelect} ${errors.division ? styles.inputError : ''}`}
                >
                  {(divisions[formData.department] || [{ value: '', label: 'Select Division first' }]).map((div) => (
                    <option key={div.value} value={div.value}>
                      {div.label}
                    </option>
                  ))}
                </select>
                {errors.division && <span className={styles.errorText}>{errors.division}</span>}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={handleBackStep}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className={styles.nextButton}
                  onClick={handleNextStep}
                  disabled={!(formData.department && formData.division) || loading}
                >
                  {loading ? 'Next...' : 'Next'}
                </button>
              </div>
            </>
          )}
          
          {step === RegisterStep.Confirmation && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <FontAwesomeIcon icon={faLock} className={styles.formIcon} />
                  Confirm Password
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleToggleConfirmPassword}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon 
                      icon={showConfirmPassword ? faKey : faLock} 
                      className={styles.toggleIcon} 
                    />
                  </button>
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={handleBackStep}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !(formData.confirmPassword && formData.confirmPassword === formData.password)}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
                <button 
                  type="button" 
                  className={styles.linkButton}
                  onClick={() => {
                    // navigate('/login');
                  }}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;