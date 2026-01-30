import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            navigate('/');
        } else {
            // Handle error case
            navigate('/auth', { state: { error: "로그인에 실패했습니다." } });
        }
    }, [location, navigate]);

    return (
        <div>
            <p>로그인 처리 중...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
