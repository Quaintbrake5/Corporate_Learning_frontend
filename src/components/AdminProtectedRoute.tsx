import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user: reduxUser } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Fallback: Check localStorage to handle timing issues where 
  // Redux state hasn't fully propagated yet
  const hasToken = !!localStorage.getItem('access_token');
  const authenticated = isAuthenticated || hasToken;

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get user from Redux or localStorage for role check
  const user = reduxUser || JSON.parse(localStorage.getItem('user') || 'null');
  
  // Check for admin role using the most reliable user source
  if (user?.role?.toLowerCase() !== 'admin') {
    // If authenticated but not admin, redirect to normal dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
