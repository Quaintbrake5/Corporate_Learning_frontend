import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import styles from './AdminLayout.module.css';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { path: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { path: '/admin/courses', label: 'Courses', icon: 'fa-solid fa-book' },
];

const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logoContainer}>
          <button className={styles.toggleButton} onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-bars"></i>}
          </button>
          <div className={styles.logoContent}>
            <i className="fa-solid fa-shield-halved"></i>
            {!isCollapsed && <h2>Admin CLP</h2>}
          </div>
        </div>

        <nav className={styles.navMenu}>
          <ul>
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  end={item.path === '/admin'}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <i className={`${item.icon} ${styles.navIcon}`}></i>
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={styles.logoutContainer}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <Header />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
