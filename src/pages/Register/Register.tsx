import React, { useState } from 'react';
import styles from './Register.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faUser, faLock, faPhone, faBuilding, faUserGroup, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
        console.log('Registration successful:', formData);
        // navigate('/login');
      } catch (error) {
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
          <div className={styles.logoWrapper}>
            <img src={nlngLogo} alt="NLNG Logo" className={styles.registerLogo} />
          </div>
          <h2 className={styles.companyName}>NLNG</h2>
          <p className={styles.companySub}>NIGERIA LNG LIMITED</p>
          
          <div className={styles.divider}></div>
          
          <h3 className={styles.appTitle}>Corporate Learning Platform</h3>
          <p className={styles.appSub}>NLNG Corporate Services</p>
        </div>

        <div className={styles.progressContainer}>
           <div className={styles.progressBar}></div>
        </div>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          {step === RegisterStep.PersonalInfo && (
            <>
              <h4 className={styles.formTitle}>Create Your Account</h4>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
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
                </div>
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  Username
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.username ? styles.inputError : ''}`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && <span className={styles.errorText}>{errors.username}</span>}
              </div>
              
              <div className={styles.navButtons}>
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
              <h4 className={styles.formTitle}>Set Up Credentials</h4>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleTogglePassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faEye : faEyeSlash} 
                    />
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pin" className={styles.formLabel}>
                  PIN (Optional)
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
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
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleTogglePin}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    <FontAwesomeIcon 
                      icon={showPin ? faEye : faEyeSlash} 
                    />
                  </button>
                </div>
                {errors.pin && <span className={styles.errorText}>{errors.pin}</span>}
              </div>
              
              <div className={styles.navButtons}>
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
              <h4 className={styles.formTitle}>Department & Division</h4>
              <div className={styles.formGroup}>
                <label htmlFor="department" className={styles.formLabel}>
                  Department
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.department ? styles.inputError : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && <span className={styles.errorText}>{errors.department}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="division" className={styles.formLabel}>
                  Division
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUserGroup} className={styles.inputIcon} />
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.division ? styles.inputError : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    {(divisions[formData.department] || [{ value: '', label: 'Select Division first' }]).map((div) => (
                      <option key={div.value} value={div.value}>
                        {div.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.division && <span className={styles.errorText}>{errors.division}</span>}
              </div>
              
              <div className={styles.navButtons}>
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
              <h4 className={styles.formTitle}>Confirm Password</h4>
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={handleToggleConfirmPassword}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon 
                      icon={showConfirmPassword ? faEye : faEyeSlash} 
                    />
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
              
              <div className={styles.navButtons}>
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
              </div>
            </>
          )}
          <button 
            type="button" 
            className={styles.linkButton}
            onClick={() => {
              // navigate('/login');
            }}
          >
            Already have an account? Sign In
          </button>
        </form>

        <div className={styles.systemFooter}>
          NLNG HRMS - Corporate Learning Platform
        </div>
      </div>
    </div>
  );
};

export default Register;