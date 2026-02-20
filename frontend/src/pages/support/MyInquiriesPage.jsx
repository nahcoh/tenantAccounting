import { useMemo } from 'react';

const TYPE_LABELS = {
  QUESTION: '문의',
  SUGGESTION: '건의',
};

const STATUS_LABELS = {
  OPEN: '접수',
  ANSWERED: '답변완료',
  CLOSED: '종료',
};

export default function MyInquiriesPage() {
  const inquiries = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem('support_inquiry_drafts') || '[]');
    return stored;
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">내 문의 내역</h2>
        <p className="text-sm text-gray-500 mt-1">API 연동 전 MVP 임시 목록입니다.</p>

        <div className="mt-6 space-y-3">
          {inquiries.length === 0 ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6">
              아직 작성한 문의가 없습니다.
            </div>
          ) : (
            inquiries.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-700">
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{item.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
