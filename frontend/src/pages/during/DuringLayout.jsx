import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';

export default function DuringLayout() {
  const ctx = useOutletContext();
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <NavLink
          to="/during/maintenance"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          🔧 유지보수
        </NavLink>
      </div>
      <Outlet context={ctx} />
    </div>
  );
}
