import { useCallback, useEffect, useState } from 'react';
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

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState('ANSWERED');
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const response = await api.get('/admin/inquiries', { params });
      setInquiries(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || '문의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const openReply = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReply(inquiry.adminReply || '');
    setReplyStatus(inquiry.status === 'CLOSED' ? 'CLOSED' : 'ANSWERED');
  };

  const submitReply = async () => {
    if (!selectedInquiry || !reply.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.patch(`/admin/inquiries/${selectedInquiry.id}/reply`, {
        adminReply: reply.trim(),
        status: replyStatus,
      });
      setSelectedInquiry(null);
      setReply('');
      await fetchInquiries();
    } catch (err) {
      alert(err.response?.data?.message || '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">운영진 문의함</h2>
        <p className="text-sm text-gray-500 mt-1">ADMIN 전용 페이지입니다.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">상태 전체</option>
            <option value="OPEN">접수</option>
            <option value="ANSWERED">답변완료</option>
            <option value="CLOSED">종료</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">유형 전체</option>
            <option value="QUESTION">문의</option>
            <option value="SUGGESTION">건의</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">유형</th>
                <th className="py-2 pr-3">제목</th>
                <th className="py-2 pr-3">작성자</th>
                <th className="py-2 pr-3">상태</th>
                <th className="py-2">작성일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">불러오는 중...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">문의가 없습니다.</td>
                </tr>
              ) : (
                inquiries.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => openReply(row)}
                  >
                    <td className="py-3 pr-3 text-gray-700">{row.id}</td>
                    <td className="py-3 pr-3 text-gray-700">{TYPE_LABELS[row.type] ?? row.type}</td>
                    <td className="py-3 pr-3 text-gray-900 font-medium">{row.title}</td>
                    <td className="py-3 pr-3 text-gray-700">{row.userEmail}</td>
                    <td className="py-3 pr-3 text-gray-700">{STATUS_LABELS[row.status] ?? row.status}</td>
                    <td className="py-3 text-gray-500">{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedInquiry && (
          <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedInquiry.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedInquiry.userName} ({selectedInquiry.userEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{selectedInquiry.content}</p>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">답변</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[120px]"
                placeholder="운영진 답변을 입력하세요"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="ANSWERED">답변완료</option>
                <option value="CLOSED">종료</option>
              </select>
              <button
                onClick={submitReply}
                disabled={submitting || !reply.trim()}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? '저장 중...' : '답변 저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
