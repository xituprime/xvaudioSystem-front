import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = { admin: 'admin', client: 'client' };

export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    if (user.role === ROLES.client) {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
