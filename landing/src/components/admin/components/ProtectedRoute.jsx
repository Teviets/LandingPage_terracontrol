import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

function ProtectedRoute() {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
}

export default ProtectedRoute;
