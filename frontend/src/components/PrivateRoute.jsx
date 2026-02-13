import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';

  console.log('[PrivateRoute] Check:', { isAuthenticated, token: token ? 'exists' : 'missing' });

  if (!isAuthenticated) {
    console.log('[PrivateRoute] Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
