import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Loader
        fullPage
        message="Loading session..."
        submessage="Verifying your credentials and access permissions..."
      />
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        state={{ message: `Access denied. Role "${user.role}" is not authorized for that page.` }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
