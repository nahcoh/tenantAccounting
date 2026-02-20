import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { id: 'calendar', label: '📅 납부 일정' },
  { id: 'overview', label: '요약' },
  { id: 'contract', label: '계약 정보' },
  { id: 'utilities', label: '공과금' },
  { id: 'loan', label: '대출/이자' },
];

export default function CostLayout() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <NavLink
            key={tab.id}
            to={`/cost/${tab.id}`}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
