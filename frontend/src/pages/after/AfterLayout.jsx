import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';

export default function AfterLayout() {
  const ctx = useOutletContext();
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <NavLink
          to="/after/checklist"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          ✅ 퇴거 체크리스트
        </NavLink>
      </div>
      <Outlet context={ctx} />
    </div>
  );
}
