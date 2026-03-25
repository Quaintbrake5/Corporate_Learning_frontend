
import styles from './Sidebar.module.css';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Overview', icon: 'fa-solid fa-home' },
  { path: '/courses', label: 'My Courses', icon: 'fa-solid fa-book-open' },
  { path: '/schedule', label: 'Schedule', icon: 'fa-solid fa-calendar-days' },
  { path: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        <button className={styles.toggleButton} onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-bars"></i>}
        </button>
        <div className={styles.logoContent}>
          <i className="fa-solid fa-anchor"></i>
          {!isCollapsed && <h2>NLNG CLP</h2>}
        </div>
      </div>

      <nav className={styles.navMenu}>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
              >
                <i className={`${item.icon} ${styles.navIcon}`}></i>
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.logoutContainer}>
         <button className={styles.logoutButton}>
           <i className="fa-solid fa-arrow-right-from-bracket"></i>
           {!isCollapsed && <span>Log Out</span>}
         </button>
       </div>
    </aside>
  );
};

export default Sidebar;
