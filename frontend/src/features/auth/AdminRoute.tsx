import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is ADMIN
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
