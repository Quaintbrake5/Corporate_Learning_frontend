import React, { useState } from 'react';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faUser, faLock, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginStep = {
  Username: 0,
  AuthMethodSelection: 1,
  Password: 2,
  Pin: 3,
} as const;

type LoginStep = typeof LoginStep[keyof typeof LoginStep];

const Login: React.FC = () => {
  const [step, setStep] = useState<LoginStep>(LoginStep.Username);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'pin'>('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
    setError(null);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNextStep = () => {
    if (step === LoginStep.Username && username.trim() !== '') {
      setStep(LoginStep.AuthMethodSelection);
    } else if (step === LoginStep.AuthMethodSelection) {
      setStep(authMethod === 'password' ? LoginStep.Password : LoginStep.Pin);
    }
  };

  const handleBackStep = () => {
    if (step === LoginStep.Password || step === LoginStep.Pin) {
      setStep(LoginStep.AuthMethodSelection);
    } else if (step === LoginStep.AuthMethodSelection) {
      setStep(LoginStep.Username);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      setError('Invalid credentials. Please try again.');
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

        {step === LoginStep.Username && (
          <form className={styles.loginForm} onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            <h4 className={styles.formTitle}>Sign in to your account</h4>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>
                Username
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={styles.formInput}
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !username.trim()}
            >
              {loading ? 'Verifying...' : 'Next'}
            </button>
          </form>
        )}

        {step === LoginStep.AuthMethodSelection && (
          <div className={styles.authMethodSelection}>
            <h3 className={styles.sectionTitle}>How would you like to sign in?</h3>
            <div className={styles.authOptions}>
              <button
                className={`${styles.authOptionButton} ${authMethod === 'password' ? styles.active : ''}`}
                onClick={() => setAuthMethod('password')}
              >
                <FontAwesomeIcon icon={faLock} className={styles.authIcon} />
                <span>Password</span>
              </button>
              <button
                className={`${styles.authOptionButton} ${authMethod === 'pin' ? styles.active : ''}`}
                onClick={() => setAuthMethod('pin')}
              >
                <FontAwesomeIcon icon={faPhone} className={styles.authIcon} />
                <span>PIN</span>
              </button>
            </div>
            <div className={styles.navButtons}>
              <button 
                className={styles.backButton} 
                onClick={handleBackStep}
              >
                Back
              </button>
              <button 
                className={styles.nextButton} 
                onClick={handleNextStep}
              >
                Next
              </button>
            </div>
          </div>
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

        {step === LoginStep.Pin && (
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <h4 className={styles.formTitle}>Sign in to your account</h4>
            <div className={styles.formGroup}>
              <label htmlFor="pin" className={styles.formLabel}>
                PIN
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input
                  type="password"
                  id="pin"
                  value={pin}
                  onChange={handlePinChange}
                  className={styles.formInput}
                  placeholder="Enter your PIN"
                  maxLength={4}
                />
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
                disabled={loading || !pin.trim()}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </form>
        )}

        <div className={styles.systemFooter}>
          NLNG HRMS - Corporate Learning Platform
        </div>
      </div>
    </div>
  );
};

export default Login;
