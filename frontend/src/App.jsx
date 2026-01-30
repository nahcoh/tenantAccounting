import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantAuth from './TenantAuth';
import TenantHousingAppV3 from './TenantHousingAppV3';
import OAuth2RedirectHandler from "./OAuth2RedirectHandler";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<TenantAuth />} />
        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />

        <Route path="/" element={
          <PrivateRoute>
            <TenantHousingAppV3 />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
