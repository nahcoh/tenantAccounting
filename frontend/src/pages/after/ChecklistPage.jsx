import React from 'react';

const checklistItems = [
  { id: 1, label: '보증금 반환 일정 확인', done: false },
  { id: 2, label: '시설물 원상복구 확인', done: false },
  { id: 3, label: '공과금 정산 완료', done: false },
  { id: 4, label: '전입신고 말소', done: false },
  { id: 5, label: '퇴거 전 사진 촬영', done: false },
  { id: 6, label: '열쇠 반환', done: false },
];

export default function ChecklistPage() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">퇴거 체크리스트</h3>
      {checklistItems.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <span className={`text-lg ${item.done ? 'text-green-500' : 'text-gray-300'}`}>
            {item.done ? '☑️' : '⬜'}
          </span>
          <p className={`${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
