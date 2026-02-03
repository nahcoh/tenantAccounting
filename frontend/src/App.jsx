import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantAuth from './TenantAuth';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import CostLayout from './pages/cost/CostLayout';
import CalendarPage from './pages/cost/CalendarPage';
import OverviewPage from './pages/cost/OverviewPage';
import ContractPage from './pages/cost/ContractPage';
import UtilitiesPage from './pages/cost/UtilitiesPage';
import LoanPage from './pages/cost/LoanPage';
import BeforeLayout from './pages/before/BeforeLayout';
import DocumentsPage from './pages/before/DocumentsPage';
import TermsPage from './pages/before/TermsPage';
import DuringLayout from './pages/during/DuringLayout';
import MaintenancePage from './pages/during/MaintenancePage';
import AfterLayout from './pages/after/AfterLayout';
import ChecklistPage from './pages/after/ChecklistPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<TenantAuth />} />
        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/before/documents" replace />} />

            <Route path="cost" element={<CostLayout />}>
              <Route index element={<Navigate to="calendar" replace />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="contract" element={<ContractPage />} />
              <Route path="utilities" element={<UtilitiesPage />} />
              <Route path="loan" element={<LoanPage />} />
            </Route>

            <Route path="before" element={<BeforeLayout />}>
              <Route index element={<Navigate to="documents" replace />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>

            <Route path="during" element={<DuringLayout />}>
              <Route index element={<Navigate to="maintenance" replace />} />
              <Route path="maintenance" element={<MaintenancePage />} />
            </Route>

            <Route path="after" element={<AfterLayout />}>
              <Route index element={<Navigate to="checklist" replace />} />
              <Route path="checklist" element={<ChecklistPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
