import React from 'react';
import { getStatusStyle } from '../../lib/utils';

const maintenanceRecords = [
  {
    id: 1,
    title: '보일러 고장 수리',
    category: 'repair',
    date: '2024-02-10',
    status: 'completed',
    cost: 150000,
    paidBy: 'landlord',
    description: '보일러 점화 불량으로 수리업체 호출',
    photos: 3,
    receipts: 1
  },
];

function StatusBadge({ status }) {
  const { className, label } = getStatusStyle(status);
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{label}</span>;
}

export default function MaintenancePage() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">유지보수 기록</h3>
        <span className="text-sm text-gray-500">{maintenanceRecords.length}건</span>
      </div>
      {maintenanceRecords.map(record => (
        <div key={record.id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <h4 className="font-medium text-gray-900">{record.title}</h4>
            </div>
            <StatusBadge status={record.status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{record.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>📅 {record.date}</span>
            <span>💰 {record.cost.toLocaleString()}원</span>
            <span>{record.paidBy === 'landlord' ? '임대인 부담' : '세입자 부담'}</span>
            <span>📷 {record.photos}장</span>
          </div>
        </div>
      ))}
    </div>
  );
}
