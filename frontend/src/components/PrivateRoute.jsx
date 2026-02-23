import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { status } = useAuth();

  if (status === 'checking') {
    return <div className="p-6 text-center text-gray-500">인증 확인 중...</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
