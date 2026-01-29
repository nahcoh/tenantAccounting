import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantAuth from './TenantAuth';
import TenantHousingAppV3 from './TenantHousingAppV3';

// 모든 페이지 접근 허용
const PrivateRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/auth" element={<TenantAuth onLoginSuccess={() => window.location.href = '/'} />} />

        {/* 메인 앱 (통합 버전) */}
        <Route path="/" element={
          <PrivateRoute>
            <TenantHousingAppV3 />
          </PrivateRoute>
        } />

        {/* 그 외 경로는 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* 개발용 내비게이션 (로그인/메인 이동) */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <a href="/" className="px-2 py-1 bg-black text-white text-[10px] rounded hover:bg-gray-800">Main</a>
        <a href="/auth" className="px-2 py-1 bg-purple-600 text-white text-[10px] rounded hover:bg-purple-500">Login</a>
      </div>
    </Router>
  );
}

export default App;