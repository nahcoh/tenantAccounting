import axios from 'axios';

// 프로덕션/개발 환경 공통으로 상대 경로 사용
// CloudFront Behavior (/*)가 이 요청을 백엔드(api.ziplog.kr:8080)로 전달함
const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('accessToken');
  
  // 잘못된 문자열 값 정제
  if (token === 'null' || token === 'undefined') {
    localStorage.removeItem('accessToken');
    token = null;
  }

  if (token && token.length > 10) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    // 만약 API 응답인데 HTML이 왔다면, 이는 CloudFront가 에러를 가로채서 S3 파일을 보낸 상황임
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.error('[API Error] Received HTML instead of JSON. Check CloudFront/WAF behavior.');
      return Promise.reject(new Error('HTML_RESPONSE_FROM_API'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 또는 HTML 응답 시 토큰 갱신 시도
    if ((error.response?.status === 401 || error.message === 'HTML_RESPONSE_FROM_API') && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken && refreshToken !== 'null' && refreshToken !== 'undefined') {
        try {
          // 리프레시 시도
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
