import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser, faChevronDown, faBell } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.searchContainer}>
        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for anything..." 
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} className={styles.notificationIcon} />
          <span className={styles.badge}></span>
        </button>
        
        <div className={styles.profile}>
          <div className={styles.avatarInfo}>
            <span className={styles.name}>Alex Parker</span>
            <span className={styles.role}>CSD (Digital)</span>
          </div>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUser} className={styles.avatarIcon} />
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={styles.chevronIcon} />
        </div>
      </div>
    </header>
  );
};

export default Header;
