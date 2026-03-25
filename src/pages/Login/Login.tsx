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
  const [step, setStep] = useState<LoginStep>(LoginStep.Username); // 1: username, 2: password/pin selection, 3: password input, 4: pin input
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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would call your authentication service here
      // Redirect to dashboard or appropriate page
      // navigate('/dashboard');
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
          <img
            src={nlngLogo}
            alt="NLNG Logo"
            className={styles.loginLogo}
          />
          <h2 className={styles.loginTitle}>Corporate Learning Platform</h2>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${step === LoginStep.Username ? styles.active : ''}`}
              style={{ width: '33%' }}
            ></div>
            <div 
              className={`${styles.progressFill} ${step === LoginStep.AuthMethodSelection ? styles.active : ''}`}
              style={{ width: '33%' }}
            ></div>
             <div 
               className={`${styles.progressFill} ${(step === LoginStep.Password || step === LoginStep.Pin) ? styles.active : ''}`}
               style={{ width: '34%' }}
             ></div>
          </div>
          <div className={styles.progressLabels}>
              <span className={`${styles.progressLabel} ${step === LoginStep.Username ? styles.active : ''}`}>1. Username</span>
             <span className={`${styles.progressLabel} ${step === LoginStep.AuthMethodSelection ? styles.active : ''}`}>2. Auth Method</span>
             <span className={`${styles.progressLabel} ${(step === LoginStep.Password || step === LoginStep.Pin) ? styles.active : ''}`}>3. Credentials</span>
          </div>
        </div>

        {step === LoginStep.Username && (
          <form className={styles.loginForm} onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>
                <FontAwesomeIcon icon={faUser} className={styles.formIcon} />
                Username
              </label>
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
                <span>NLNG Password</span>
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
                    icon={showPassword ? faEye : faEyeSlash} 
                    className={styles.toggleIcon} 
                  />
                </button>
              </label>
               <input
                 type={showPassword ? 'text' : 'password'}
                 id="password"
                 value={password}
                 onChange={handlePasswordChange}
                 className={styles.formInput}
                 placeholder="Enter your NLNG password"
               />
            </div>
            <div className={styles.navButtons}>
              <button 
                className={styles.backButton} 
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
            <div className={styles.formGroup}>
              <label htmlFor="pin" className={styles.formLabel}>
                <FontAwesomeIcon icon={faLock} className={styles.formIcon} />
                PIN
              </label>
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
            <div className={styles.navButtons}>
              <button 
                className={styles.backButton} 
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
      </div>
    </div>
  );
};

export default Login;