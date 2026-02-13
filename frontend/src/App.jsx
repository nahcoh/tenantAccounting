import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// RootRoute: 실시간 토큰 및 도메인 체크
const RootRoute = () => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!(token && token !== 'undefined' && token !== 'null');
  
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
  // 0. 도메인 통일
  if (window.location.hostname === 'www.ziplog.kr') {
    window.location.href = window.location.href.replace('www.ziplog.kr', 'ziplog.kr');
    return <div className="p-10 text-center">도메인 전환 중...</div>;
  }

  // 1. URL에서 토큰 추출 및 즉시 저장 (동기적 처리)
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  const accessToken = params.get('accessToken') || hashParams.get('accessToken') ||
                      params.get('token') || hashParams.get('access_token');
  const refreshToken = params.get('refreshToken') || hashParams.get('refreshToken') ||
                       params.get('refresh_token');

  // 토큰이 URL에 있으면 즉시 동기적으로 저장
  if (accessToken) {
    console.log('[App] Token found in URL, saving immediately...');
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    // URL에서 토큰 파라미터 제거하고 메인으로 이동
    window.location.replace('/');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800">로그인 정보를 확인 중입니다...</h2>
          <p className="text-slate-500 text-sm mt-2">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/auth" element={<TenantAuth />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      {/* OAuth2 콜백 처리 - URL 파라미터에서 토큰 추출 후 저장 */}
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
