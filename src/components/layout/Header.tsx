import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser, faChevronDown, faBell } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import { useAppSelector } from '../../store/hooks';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

const subdivisionMap: Record<number, string> = {
  1: 'CS',
  2: 'ENG',
  3: 'OPS',
  4: 'FIN',
  5: 'HR',
};

const Header: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const subdivision = user?.subdivision_id ? subdivisionMap[user.subdivision_id] || 'N/A' : 'N/A';
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

        <div className={styles.profile} onClick={() => setIsProfileModalOpen(true)}>
          <div className={styles.avatarInfo}>
            <span className={styles.name}>{user?.name || 'User'}</span>
            <span className={styles.role}>{subdivision}</span>
          </div>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUser} className={styles.avatarIcon} />
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={styles.chevronIcon} />
        </div>
        
        <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
