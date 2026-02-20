const SAMPLE_ROWS = [
  {
    id: 101,
    type: 'QUESTION',
    title: '자동이체 등록이 안 됩니다.',
    writer: 'user1@ziplog.kr',
    status: 'OPEN',
    createdAt: '2026-02-20 09:10',
  },
  {
    id: 102,
    type: 'SUGGESTION',
    title: '달력에서 월별 합계 고정 표시 부탁드립니다.',
    writer: 'user2@ziplog.kr',
    status: 'ANSWERED',
    createdAt: '2026-02-19 15:42',
  },
];

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
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">운영진 문의함</h2>
        <p className="text-sm text-gray-500 mt-1">
          ADMIN 전용 페이지입니다. 현재는 API 연결 전 샘플 데이터로 구성되어 있습니다.
        </p>

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
              {SAMPLE_ROWS.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3 text-gray-700">{row.id}</td>
                  <td className="py-3 pr-3 text-gray-700">{TYPE_LABELS[row.type] ?? row.type}</td>
                  <td className="py-3 pr-3 text-gray-900 font-medium">{row.title}</td>
                  <td className="py-3 pr-3 text-gray-700">{row.writer}</td>
                  <td className="py-3 pr-3 text-gray-700">{STATUS_LABELS[row.status] ?? row.status}</td>
                  <td className="py-3 text-gray-500">{row.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
