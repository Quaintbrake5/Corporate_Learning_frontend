import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const hasToken = !!localStorage.getItem('access_token');
  const authenticated = isAuthenticated || hasToken;

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin role
  if (user?.role !== 'admin') {
    // If authenticated but not admin, redirect to normal dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
