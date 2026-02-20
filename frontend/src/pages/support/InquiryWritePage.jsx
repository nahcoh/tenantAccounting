import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

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
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => {
    return form.title.trim().length >= 2 && form.content.trim().length >= 10;
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    // API 연동 전 MVP 임시 동작: 작성 데이터 로컬 저장
    const draftKey = 'support_inquiry_drafts';
    const drafts = JSON.parse(localStorage.getItem(draftKey) || '[]');
    drafts.unshift({
      ...form,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    });
    localStorage.setItem(draftKey, JSON.stringify(drafts));

    setSubmitted(true);
    setForm({ type: 'QUESTION', title: '', content: '', isPrivate: true });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">운영진 문의/건의 작성</h2>
        <p className="text-sm text-gray-500 mt-1">
          현재는 MVP 화면입니다. API 연결 후 실제 전송이 동작합니다.
        </p>
        <div className="mt-3">
          <Link to="/support/my-inquiries" className="text-sm text-blue-600 hover:text-blue-700">
            내 문의 내역 보기
          </Link>
        </div>

        {submitted && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            작성 내용이 임시 저장되었습니다. API 연결 후 실제 문의로 전송됩니다.
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
              disabled={!isValid}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              문의 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
