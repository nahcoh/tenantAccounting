import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import TenantAuth from './TenantAuth';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import CostLayout from './pages/cost/CostLayout';
import CalendarPage from './pages/cost/CalendarPage';
import OverviewPage from './pages/cost/OverviewPage';
import ContractPage from './pages/cost/ContractPage';
import UtilitiesPage from './pages/cost/UtilitiesPage';
import LoanPage from './pages/cost/LoanPage';
import BeforeLayout from './pages/before/BeforeLayout';
import DocumentsPage from './pages/before/DocumentsPage';
import TermsPage from './pages/before/TermsPage';
import BeforeChecklistPage from './pages/before/ChecklistPage';
import DuringLayout from './pages/during/DuringLayout';
import MaintenancePage from './pages/during/MaintenancePage';
import AfterLayout from './pages/after/AfterLayout';
import ChecklistPage from './pages/after/ChecklistPage';

// RootRoute: 실시간 토큰 및 도메인 체크
const RootRoute = () => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';
  
  console.log('[RootRoute] Check:', { isAuthenticated, token: token ? 'exists' : 'missing' });

  // 이미 로그인된 사용자가 메인에 오면 대시보드로, 아니면 랜딩페이지로
  if (isAuthenticated) {
    console.log('[RootRoute] Authenticated, redirecting to dashboard');
    return <Navigate to="/before/documents" replace />;
  }
  
  console.log('[RootRoute] Not authenticated, showing LandingPage');
  return <LandingPage />;
};

function App() {
  // URL에서 토큰 정보를 더 강력하게 가로채기
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // 가능한 모든 토큰 이름 체크
    const accessToken = searchParams.get('accessToken') || hashParams.get('accessToken') || 
                        searchParams.get('token') || hashParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || hashParams.get('refreshToken') ||
                         searchParams.get('refresh_token') || hashParams.get('refresh_token');

    console.log('[App] Current URL:', window.location.href);
    console.log('[App] URL Parameters:', Object.fromEntries(searchParams.entries()));
    console.log('[App] Hash Parameters:', Object.fromEntries(hashParams.entries()));

    if (accessToken) {
      console.log('[App] Found access token! Saving to localStorage...');
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      
      // 토큰 정보를 지우고 깨끗한 메인 페이지로 이동 (리프레시)
      window.location.href = '/';
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/auth" element={<TenantAuth />} />
      <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />

        {/* 인증이 필요한 모든 경로를 하나로 묶음 */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            {/* 기본 대시보드 진입점 */}
            <Route path="before/*" element={<BeforeLayout />}>
              <Route index element={<Navigate to="documents" replace />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="checklist" element={<BeforeChecklistPage />} />
            </Route>

            <Route path="cost/*" element={<CostLayout />}>
              <Route index element={<Navigate to="calendar" replace />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="contract" element={<ContractPage />} />
              <Route path="utilities" element={<UtilitiesPage />} />
              <Route path="loan" element={<LoanPage />} />
            </Route>

            <Route path="during/*" element={<DuringLayout />}>
              <Route index element={<Navigate to="maintenance" replace />} />
              <Route path="maintenance" element={<MaintenancePage />} />
            </Route>

            <Route path="after/*" element={<AfterLayout />}>
              <Route index element={<Navigate to="checklist" replace />} />
              <Route path="checklist" element={<ChecklistPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
