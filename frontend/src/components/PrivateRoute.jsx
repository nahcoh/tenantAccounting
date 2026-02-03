import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
