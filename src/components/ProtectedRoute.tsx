import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
   const { isAuthenticated } = useAppSelector((state) => state.auth);
   const location = useLocation();
   
   // Fallback: Check localStorage to handle timing issues where 
   // Redux state hasn't fully propagated yet
   const hasToken = !!localStorage.getItem('access_token');
   const authenticated = isAuthenticated || hasToken;

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Potential for additional user-specific checks here (e.g., is_verified)

  return <>{children}</>;
};

export default ProtectedRoute;
