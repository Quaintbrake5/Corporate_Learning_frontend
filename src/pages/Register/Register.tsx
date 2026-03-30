import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faUser, faLock, faEnvelope, faBuilding, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { register as registerUser } from '../../services/authService';

const RegisterStep = {
  PersonalInfo: 0,
  Credentials: 1,
  Confirmation: 2,
} as const;

type RegisterStep = typeof RegisterStep[keyof typeof RegisterStep];

const divisionToSubdivisionId: Record<string, number> = {
  CS: 1,
  ENG: 2,
  OPS: 3,
  FIN: 4,
  HR: 5,
};

const divisions = [
  { value: '', label: 'Select Division' },
  { value: 'CS', label: 'Corporate Services (CS)' },
  { value: 'ENG', label: 'Engineering (ENG)' },
  { value: 'OPS', label: 'Operations (OPS)' },
  { value: 'FIN', label: 'Finance (FIN)' },
  { value: 'HR', label: 'Human Resources (HR)' },
];

const VALIDATION_MESSAGES = {
  fullNameRequired: 'Full name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Email must match FirstName.LastName@nlng.com',
  divisionRequired: 'Please select a division',
  pwdRequired: 'Password required',
  pwdMinLength: 'Password must be at least 8 characters',
  pwdLowercase: 'Password must contain at least one lowercase letter',
  pwdUppercase: 'Password must contain at least one uppercase letter',
  pwdNumber: 'Password must contain at least one number',
  pwdSpecial: 'Password must contain at least one special character',
  confirmRequired: 'Please confirm your password',
  pwdMismatch: 'Mismatched passwords!',
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (!error || typeof error !== 'object') {
    return 'Registration failed. Please try again.';
  }

  const errObj = error as Record<string, unknown>;
  const responseMessage = extractFromNestedObject(errObj, ['response', 'data', 'detail'])
    || extractFromNestedObject(errObj, ['response', 'data', 'message']);

  if (responseMessage) {
    return responseMessage;
  }

  if (typeof errObj.message === 'string') {
    return errObj.message;
  }

  return 'Registration failed. Please try again.';
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

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    division: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<RegisterStep>(RegisterStep.PersonalInfo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  const handleNextStep = () => {
    if (step === RegisterStep.PersonalInfo && formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.division !== '') {
      setStep(RegisterStep.Credentials);
    } else if (step === RegisterStep.Credentials && formData.password && formData.password.length >= 8) {
      setStep(RegisterStep.Confirmation);
    }
  };

  const handleBackStep = () => {
    if (step === RegisterStep.Credentials) {
      setStep(RegisterStep.PersonalInfo);
    } else if (step === RegisterStep.Confirmation) {
      setStep(RegisterStep.Credentials);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    validateFullName(formData.fullName, newErrors);
    validateEmail(formData.email, newErrors);
    validateDivision(formData.division, newErrors);
    validatePassword(formData.password, newErrors);
    validateConfirmPassword(formData.confirmPassword, formData.password, newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFullName = (fullName: string, errors: Record<string, string>): void => {
    if (!fullName.trim()) {
      errors.fullName = VALIDATION_MESSAGES.fullNameRequired;
    }
  };

  const validateEmail = (email: string, errors: Record<string, string>): void => {
    if (!email.trim()) {
      errors.email = VALIDATION_MESSAGES.emailRequired;
      return;
    }

    const emailPattern = /^[A-Za-z]+\.[A-Za-z]+@nlng\.com$/;
    if (!emailPattern.test(email)) {
      errors.email = VALIDATION_MESSAGES.emailInvalid;
    }
  };

  const validateDivision = (division: string, errors: Record<string, string>): void => {
    if (!division) {
      errors.division = VALIDATION_MESSAGES.divisionRequired;
    }
  };

  const validatePassword = (password: string, errors: Record<string, string>): void => {
    if (!password) {
      errors.password = VALIDATION_MESSAGES.pwdRequired;
      return;
    }

    const passwordValidationRules: Array<{ test: RegExp; message: string }> = [
      { test: /.{8,}/, message: VALIDATION_MESSAGES.pwdMinLength },
      { test: /(?=.*[a-z])/, message: VALIDATION_MESSAGES.pwdLowercase },
      { test: /(?=.*[A-Z])/, message: VALIDATION_MESSAGES.pwdUppercase },
      { test: /(?=.*\d)/, message: VALIDATION_MESSAGES.pwdNumber },
      { test: /[!@#$%^&*(),.?":{}|<>]/, message: VALIDATION_MESSAGES.pwdSpecial },
    ];

    for (const rule of passwordValidationRules) {
      if (!rule.test.test(password)) {
        errors.password = rule.message;
        return;
      }
    }
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
    errors: Record<string, string>
  ): void => {
    if (!confirmPassword) {
      errors.confirmPassword = VALIDATION_MESSAGES.confirmRequired;
      return;
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = VALIDATION_MESSAGES.pwdMismatch;
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setApiError('');
      try {
        const subdivisionId = divisionToSubdivisionId[formData.division];
        await registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          subdivision_id: subdivisionId,
        });
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } catch (error: unknown) {
        setApiError(extractErrorMessage(error));
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
          {apiError && (
            <div className={styles.errorText} style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {apiError}
            </div>
          )}

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
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
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
                <label htmlFor="division" className={styles.formLabel}>
                  Division
                </label>
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
                    {divisions.map(div => (
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
                  className={styles.nextButton}
                  onClick={handleNextStep}
                  disabled={!(formData.fullName.trim() && formData.email.trim() && formData.division) || loading}
                >
                  Next
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
                  className={styles.nextButton}
                  onClick={handleNextStep}
                  disabled={!(formData.password && formData.password.length >= 8 && formData.confirmPassword) || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === RegisterStep.Confirmation && (
            <>
              <h4 className={styles.formTitle}>Review & Confirm</h4>

              <div className={styles.formGroup}>
                <label htmlFor="confirmFullName" className={styles.formLabel}>Full Name</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                  <input
                    id="confirmFullName"
                    type="text"
                    value={formData.fullName}
                    className={styles.formInput}
                    disabled
                    aria-label="Full name confirmation"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmEmail" className={styles.formLabel}>Email</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input
                    id="confirmEmail"
                    type="email"
                    value={formData.email}
                    className={styles.formInput}
                    disabled
                    aria-label="Email confirmation"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmDivision" className={styles.formLabel}>Division</label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                  <input
                    id="confirmDivision"
                    type="text"
                    value={divisions.find(d => d.value === formData.division)?.label || ''}
                    className={styles.formInput}
                    disabled
                    aria-label="Division confirmation"
                  />
                </div>
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
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className={styles.linkButton}
            title="Already have an account? Sign In"
            aria-label="Already have an account? Sign In"
            onClick={() => {
              navigate('/login');
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
