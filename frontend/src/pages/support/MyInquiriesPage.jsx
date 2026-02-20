import { useEffect, useState } from 'react';
import api from '../../api';

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
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/inquiries/mine');
        setInquiries(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || '문의 내역을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">내 문의 내역</h2>
        <p className="text-sm text-gray-500 mt-1">등록한 문의와 운영진 답변을 확인할 수 있습니다.</p>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6">
              불러오는 중...
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-6">
              {error}
            </div>
          ) : inquiries.length === 0 ? (
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
                {item.adminReply && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">운영진 답변</p>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{item.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
