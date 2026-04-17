import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faUser, faLock, faEnvelope, faBuilding, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { register as registerUser } from '../../services/authService';
import api from '../../services/api';

const RegisterStep = {
  PersonalInfo: 0,
  Credentials: 1,
  Confirmation: 2,
} as const;

type RegisterStep = typeof RegisterStep[keyof typeof RegisterStep];

interface Subdivision {
  id: number;
  name: string;
  division_id: number;
}

interface Division {
  id: number;
  code: string;
  name: string | null;
  subdivisions: Subdivision[];
}

const VALIDATION_MESSAGES = {
  fullNameRequired: 'Full name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Email must match FirstName.LastName@nlng.com',
  divisionRequired: 'Please select a division',
  departmentRequired: 'Please select a department',
  pwdRequired: 'Password required',
  pwdMinLength: 'Password must be at least 8 characters',
  pwdLowercase: 'Password must contain at least one lowercase letter',
  pwdUppercase: 'Password must contain at least one uppercase letter',
  pwdNumber: 'Password must contain at least one number',
  pwdSpecial: 'Password must contain at least one special character',
  confirmRequired: 'Please confirm your password',
  pwdMismatch: 'Mismatched passwords!',
};

const extractFromNestedObject = (
  obj: Record<string, unknown>,
  keys: string[]
): string | null => {
  let current: unknown = obj;

  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : null;
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== 'object') return 'Registration failed. Please try again.';

  const errObj = error as Record<string, unknown>;
  const responseMessage = extractFromNestedObject(errObj, ['response', 'data', 'detail'])
    || extractFromNestedObject(errObj, ['response', 'data', 'message']);

  return responseMessage || (typeof errObj.message === 'string' ? errObj.message : 'Registration failed. Please try again.');
};

// --- Validation Helpers ---
const validatePasswordRules = (password: string) => {
  if (!password) return VALIDATION_MESSAGES.pwdRequired;
  
  const rules = [
    { test: /.{8,}/, message: VALIDATION_MESSAGES.pwdMinLength },
    { test: /(?=.*[a-z])/, message: VALIDATION_MESSAGES.pwdLowercase },
    { test: /(?=.*[A-Z])/, message: VALIDATION_MESSAGES.pwdUppercase },
    { test: /(?=.*\d)/, message: VALIDATION_MESSAGES.pwdNumber },
    { test: /[!@#$%^&*(),.?":{}|<>]/, message: VALIDATION_MESSAGES.pwdSpecial },
  ];

  for (const rule of rules) {
    if (!rule.test.test(password)) return rule.message;
  }
  return null;
};

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Subdivision[]>([]);
  const [divisionsLoading, setDivisionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    division: '',
    department: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<RegisterStep>(RegisterStep.PersonalInfo);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await api.get<Division[]>('/divisions');
        setDivisions(response.data);
      } catch {
        // Silently fail
      } finally {
        setDivisionsLoading(false);
      }
    };
    fetchDivisions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');

    if (name === 'division') {
      const selectedDivision = divisions.find(d => d.id === Number(value));
      setDepartments(selectedDivision?.subdivisions ?? []);
      setFormData(prev => ({ ...prev, department: '' }));
    }
  };

  const handleNextStep = () => {
    const isFirstStepValid = step === RegisterStep.PersonalInfo && 
      formData.fullName.trim() !== '' && 
      formData.email.trim() !== '' && 
      formData.division !== '' && 
      formData.department !== '';
      
    const isSecondStepValid = step === RegisterStep.Credentials && 
      formData.password && 
      formData.password.length >= 8;

    if (isFirstStepValid) {
      setStep(RegisterStep.Credentials);
    } else if (isSecondStepValid) {
      setStep(RegisterStep.Confirmation);
    }
  };

  const handleBackStep = () => {
    if (step === RegisterStep.Credentials) setStep(RegisterStep.PersonalInfo);
    else if (step === RegisterStep.Confirmation) setStep(RegisterStep.Credentials);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = VALIDATION_MESSAGES.fullNameRequired;
    
    if (!formData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.emailRequired;
    } else if (!/^[A-Za-z]+\.[A-Za-z]+@nlng\.com$/.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.emailInvalid;
    }

    if (!formData.division) newErrors.division = VALIDATION_MESSAGES.divisionRequired;
    if (!formData.department) newErrors.department = VALIDATION_MESSAGES.departmentRequired;

    const pwdError = validatePasswordRules(formData.password);
    if (pwdError) newErrors.password = pwdError;

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.confirmRequired;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.pwdMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        subdivision_id: Number(formData.department),
      });
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (error: unknown) {
      setApiError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const deptPlaceholder = useMemo(() => {
    if (formData.division) {
       return departments.length === 0 ? 'No departments available' : 'Select Department';
    }
    return 'Select a division first';
  }, [formData.division, departments.length]);

  const isNextDisabled = useMemo(() => {
    if (step === RegisterStep.PersonalInfo) {
      return !formData.fullName.trim() || !formData.email.trim() || !formData.division || !formData.department || loading;
    }
    if (step === RegisterStep.Credentials) {
      return !(formData.password && formData.password.length >= 8 && formData.confirmPassword) || loading;
    }
    return loading;
  }, [step, formData, loading]);

  const getDivisionValue = () => {
    const div = divisions.find(d => d.id === Number(formData.division));
    return div?.name || div?.code || '';
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
          {apiError && (
            <div className={styles.errorText} style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {apiError}
            </div>
          )}

          {step === RegisterStep.PersonalInfo && (
            <div key="step-0">
              <h4 className={styles.formTitle}>Create Your Account</h4>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>Full Name</label>
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
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                    placeholder="FirstName.LastName@nlng.com"
                  />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="division" className={styles.formLabel}>Division</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.division ? styles.inputError : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    <option value="">{divisionsLoading ? 'Loading...' : 'Select Division'}</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name || div.code}</option>
                    ))}
                  </select>
                </div>
                {errors.division && <span className={styles.errorText}>{errors.division}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="department" className={styles.formLabel}>Department</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.department ? styles.inputError : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={!formData.division}
                  >
                    <option value="">{deptPlaceholder}</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                {errors.department && <span className={styles.errorText}>{errors.department}</span>}
              </div>

              <div className={styles.navButtons}>
                <button type="button" className={styles.nextButton} onClick={handleNextStep} disabled={isNextDisabled}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === RegisterStep.Credentials && (
            <div key="step-1">
              <h4 className={styles.formTitle}>Set Up Credentials</h4>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>Password</label>
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
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>

              <div className={styles.navButtons}>
                <button type="button" className={styles.nextButton} onClick={handleNextStep} disabled={isNextDisabled}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === RegisterStep.Confirmation && (
            <div key="step-2">
              <h4 className={styles.formTitle}>Review & Confirm</h4>
              <div className={styles.formGroup}>
                <label htmlFor="confirmFullName" className={styles.formLabel}>Full Name</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                  <input id="confirmFullName" type="text" value={formData.fullName} className={styles.formInput} disabled />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmEmail" className={styles.formLabel}>Email</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input id="confirmEmail" type="email" value={formData.email} className={styles.formInput} disabled />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmDivision" className={styles.formLabel}>Division</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <input id="confirmDivision" type="text" value={getDivisionValue()} className={styles.formInput} disabled />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmDepartment" className={styles.formLabel}>Department</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <input id="confirmDepartment" type="text" value={departments.find(d => d.id === Number(formData.department))?.name || ''} className={styles.formInput} disabled />
                </div>
              </div>
              <div className={styles.navButtons}>
                <button type="button" className={styles.backButton} onClick={handleBackStep}>Back</button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate('/login')}
          >
            Already have an account? Sign In
          </button>
        </form>

        <div className={styles.systemFooter}>NLNG HRMS - Corporate Learning Platform</div>
      </div>
    </div>
  );
};

export default Register;
