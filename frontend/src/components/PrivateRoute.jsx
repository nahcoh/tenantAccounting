import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api';

export default function PrivateRoute() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        await api.get('/auth/me');
        if (mounted) setStatus('authenticated');
      } catch {
        if (mounted) setStatus('unauthenticated');
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return <div className="p-6 text-center text-gray-500">인증 확인 중...</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
