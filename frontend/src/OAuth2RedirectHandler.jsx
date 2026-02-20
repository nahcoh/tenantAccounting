import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        await api.get('/auth/me');
        navigate('/cost/calendar', { replace: true });
      } catch {
        navigate('/auth', { replace: true, state: { error: '로그인에 실패했습니다.' } });
      }
    };

    verifySession();
  }, [navigate]);

  return (
    <div>
      <p>로그인 처리 중...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
