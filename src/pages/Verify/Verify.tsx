import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styles from './Verify.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nlngLogo from '/NLNG logo.jpg';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { verifyEmail } from '../../services/authService';

const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'Invalid or missing verification token.');

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyToken = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in.');
      } catch (err: unknown) {
        setStatus('error');
        const errorObj = err as { response?: { data?: { detail?: string; message?: string } } };
        const errorMessage =
          errorObj.response?.data?.detail ||
          errorObj.response?.data?.message ||
          'Verification failed. The link may be expired or invalid.';
        setMessage(typeof errorMessage === 'string' ? errorMessage : 'Verification failed.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        <div className={styles.verifyHeader}>
          <div className={styles.logoWrapper}>
            <img src={nlngLogo} alt="NLNG Logo" className={styles.verifyLogo} />
          </div>
          <h2 className={styles.companyName}>NLNG</h2>
          <p className={styles.companySub}>NIGERIA LNG LIMITED</p>
          
          <div className={styles.divider}></div>
          
          <h3 className={styles.appTitle}>Corporate Learning Platform</h3>
          <p className={styles.appSub}>NLNG Corporate Services</p>
        </div>

        <div className={styles.verifyForm}>
          {status === 'loading' && (
            <div className={styles.statusSection}>
              <FontAwesomeIcon icon={faSpinner} spin className={styles.statusIcon} style={{ color: '#00B4DB' }} />
              <h4 className={styles.formTitle}>Verifying</h4>
              <p className={styles.statusMessage}>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className={styles.statusSection}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.statusIcon} style={{ color: '#20D071' }} />
              <h4 className={styles.formTitle}>Success</h4>
              <p className={styles.statusMessage}>{message}</p>
              
              <button 
                className={styles.submitButton}
                onClick={() => navigate('/login')}
              >
                Proceed to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className={styles.statusSection}>
              <FontAwesomeIcon icon={faTimesCircle} className={styles.statusIcon} style={{ color: '#ff8a8a' }} />
              <h4 className={styles.formTitle}>Verification Failed</h4>
              <p className={styles.statusMessage}>{message}</p>
              
              <Link to="/register" className={styles.backButton} style={{ textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}>
                Back to Registration
              </Link>
            </div>
          )}
        </div>

        <div className={styles.systemFooter}>
          NLNG HRMS - Corporate Learning Platform
        </div>
      </div>
    </div>
  );
};

export default Verify;
