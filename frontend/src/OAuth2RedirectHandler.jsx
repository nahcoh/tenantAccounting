import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { resolvePostLoginRoute } from './lib/postLoginRoute';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  useEffect(() => {
    const verifySession = async () => {
      for (let i = 0; i < 3; i += 1) {
        const currentUser = await refreshMe({ force: true });
        if (currentUser) {
          const targetRoute = await resolvePostLoginRoute();
          navigate(targetRoute, { replace: true });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      navigate('/auth', { replace: true, state: { error: '로그인에 실패했습니다.' } });
    };

    verifySession();
  }, [navigate, refreshMe]);

  return (
    <div>
      <p>로그인 처리 중...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
