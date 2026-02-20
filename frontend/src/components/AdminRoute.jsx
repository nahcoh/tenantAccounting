import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api';

export default function AdminRoute() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async () => {
      try {
        const response = await api.get('/auth/me');
        const role = response.data?.role;
        if (!mounted) return;
        setStatus(role === 'ADMIN' ? 'authorized' : 'forbidden');
      } catch {
        if (mounted) setStatus('unauthenticated');
      }
    };

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return <div className="p-6 text-center text-gray-500">권한 확인 중...</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/support/inquiry" replace />;
  }

  return <Outlet />;
}
