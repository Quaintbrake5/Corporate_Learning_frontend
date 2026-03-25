
import './Topbar.css';

const Topbar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Placeholder for future context or breadcrumbs */}
      </div>
      <div className="topbar-search">
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Search courses, modules..." />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" type="button" aria-label="Shopping Cart">
          <i className="fa-solid fa-cart-shopping"></i>
        </button>
        <button className="icon-btn notification-btn" type="button" aria-label="Notifications">
          <i className="fa-regular fa-bell"></i>
          <span className="notification-badge"></span>
        </button>
        <button className="btn-primary" type="button">
          Select Subdivision Path
        </button>
        <div className="user-profile">
          <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="User Profile" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
