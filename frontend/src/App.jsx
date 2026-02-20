import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TenantAuth from './TenantAuth';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
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
import InquiryWritePage from './pages/support/InquiryWritePage';
import MyInquiriesPage from './pages/support/MyInquiriesPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';

function App() {
  if (window.location.hostname === 'www.ziplog.kr') {
    window.location.href = window.location.href.replace('www.ziplog.kr', 'ziplog.kr');
    return <div className="p-10 text-center">도메인 전환 중...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<TenantAuth />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
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

          <Route path="support">
            <Route index element={<Navigate to="inquiry" replace />} />
            <Route path="inquiry" element={<InquiryWritePage />} />
            <Route path="my-inquiries" element={<MyInquiriesPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="admin/inquiries" element={<AdminInquiriesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
