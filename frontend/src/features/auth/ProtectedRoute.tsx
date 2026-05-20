// src/features/auth/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user } = useSelector((state:any) => state.auth);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
