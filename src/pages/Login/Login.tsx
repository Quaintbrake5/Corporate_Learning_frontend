import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';
import { login } from '../../services/authService';

const LoginStep = {
  Email: 0,
  Password: 1,
} as const;

type LoginStep = typeof LoginStep[keyof typeof LoginStep];

const Login: React.FC = () => {
  const [step, setStep] = useState<LoginStep>(LoginStep.Email);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // "from" extracted inline during submit

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNextStep = () => {
    if (step === LoginStep.Email && email.trim() !== '') {
      setStep(LoginStep.Password);
    }
  };

  const handleBackStep = () => {
    if (step === LoginStep.Password) {
      setStep(LoginStep.Email);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      dispatch(setCredentials({ token: response.access_token, user: response.user }));
      
      const userRole = response.user.role?.toLowerCase() || '';
      
      // Admins always go to admin dashboard, ignore any saved "return to" URL
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      
      // Non-admins: use default path or saved stateFrom
      const defaultPath = '/';
      const stateFrom = (location.state as { from?: { pathname?: string } | string })?.from;

      let finalPath = defaultPath;
      if (stateFrom) {
        const path = typeof stateFrom === 'object' ? stateFrom.pathname : String(stateFrom);
        if (path && path !== '/' && path !== '/login') {
          finalPath = path;
        }
      }

      navigate(finalPath, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string; message?: string } } };
      const message =
        errorObj.response?.data?.detail ||
        errorObj.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(typeof message === 'string' ? message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoWrapper}>
            <img src={nlngLogo} alt="NLNG Logo" className={styles.loginLogo} />
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

        {step === LoginStep.Email && (
          <form className={styles.loginForm} onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            <h4 className={styles.formTitle}>Sign in to your account</h4>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={styles.formInput}
                  placeholder="Enter your NLNG email"
                  autoFocus
                />
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !email.trim()}
            >
              {loading ? 'Verifying...' : 'Next'}
            </button>
          </form>
        )}

        {step === LoginStep.Password && (
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <h4 className={styles.formTitle}>Sign in to your account</h4>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={styles.formInput}
                  placeholder="Enter your NLNG password"
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
            </div>
            <div className={styles.navButtons}>
              <button 
                className={styles.backButton} 
                type="button"
                onClick={handleBackStep}
              >
                Back
              </button>
              <button 
                type="submit"
                className={styles.submitButton}
                disabled={loading || !password.trim()}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
        )}

        <div className={styles.registerLink}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>

        <div className={styles.systemFooter}>
          NLNG HRMS - Corporate Learning Platform
        </div>
      </div>
    </div>
  );
};

export default Login;
