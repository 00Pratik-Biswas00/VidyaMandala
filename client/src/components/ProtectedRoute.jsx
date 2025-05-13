import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  if (!authService.isLoggedIn()) {
    // Redirect to login page if user is not logged in
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;