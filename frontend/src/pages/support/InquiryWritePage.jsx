import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import api from '../../api';

const TYPE_OPTIONS = [
  { value: 'QUESTION', label: '운영진 문의' },
  { value: 'SUGGESTION', label: '기능/서비스 건의' },
];

export default function InquiryWritePage() {
  const [form, setForm] = useState({
    type: 'QUESTION',
    title: '',
    content: '',
    isPrivate: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => {
    return form.title.trim().length >= 2 && form.content.trim().length >= 10;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');
    setSubmitted(false);
    try {
      await api.post('/inquiries', form);
      setSubmitted(true);
      setForm({ type: 'QUESTION', title: '', content: '', isPrivate: true });
    } catch (err) {
      setError(err.response?.data?.message || '문의 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">운영진 문의/건의 작성</h2>
        <p className="text-sm text-gray-500 mt-1">문의 등록 후 내 문의 내역에서 답변 상태를 확인할 수 있습니다.</p>
        <div className="mt-3">
          <Link to="/support/my-inquiries" className="text-sm text-blue-600 hover:text-blue-700">
            내 문의 내역 보기
          </Link>
        </div>

        {submitted && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            문의가 정상적으로 등록되었습니다.
          </div>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="문의 제목을 입력해 주세요"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[180px]"
              placeholder="상황을 구체적으로 작성해 주세요 (최소 10자)"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => setForm((prev) => ({ ...prev, isPrivate: e.target.checked }))}
            />
            운영진만 열람 가능(비공개)
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
