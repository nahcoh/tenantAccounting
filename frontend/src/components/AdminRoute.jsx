import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { status, user } = useAuth();

  if (status === 'checking') {
    return <div className="p-6 text-center text-gray-500">권한 확인 중...</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/support/inquiry" replace />;
  }

  return <Outlet />;
}
