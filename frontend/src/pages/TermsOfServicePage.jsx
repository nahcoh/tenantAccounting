import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          홈으로
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
          <p className="text-sm text-gray-500 mb-8">최종 수정일: 2026년 2월 13일</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
              <p>
                이 약관은 내 집 기록(이하 &quot;서비스&quot;)이 제공하는 주거 관리 서비스의 이용조건 및 절차,
                서비스 제공자와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>&quot;서비스&quot;란 회사가 제공하는 세입자 주거 관리 관련 제반 서비스를 의미합니다.</li>
                <li>&quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
                <li>&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 이용할 수 있는 자를 의미합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
                <li>서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
                <li>약관이 변경되는 경우 서비스는 변경사항을 시행일자 7일 전부터 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제4조 (서비스의 제공)</h2>
              <p>서비스는 다음과 같은 기능을 제공합니다:</p>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>임대차 계약 정보 관리</li>
                <li>계약 관련 서류 관리</li>
                <li>특약사항 관리</li>
                <li>체크리스트 관리</li>
                <li>비용(공과금, 대출, 유지보수 등) 관리</li>
                <li>기타 주거 관리에 필요한 부가 서비스</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제5조 (회원가입)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>회원가입은 이용자가 약관의 내용에 동의한 후 회원가입신청을 하고, 서비스가 이를 승낙함으로써 완료됩니다.</li>
                <li>회원가입은 이메일 주소를 통한 가입 또는 소셜 로그인(Google, Kakao)을 통해 가능합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제6조 (회원의 의무)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>회원은 본 약관 및 서비스가 정한 규정을 준수하여야 합니다.</li>
                <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
                <li>회원은 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
                <li>회원은 서비스를 불법적인 목적으로 사용해서는 안 됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제7조 (서비스의 중단)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>서비스는 시스템 점검, 보수, 교체 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 서비스 제공이 제한될 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제8조 (회원 탈퇴 및 자격 상실)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴를 요청할 수 있습니다.</li>
                <li>회원 탈퇴 시 회원의 모든 데이터는 즉시 삭제되며, 복구가 불가능합니다.</li>
                <li>서비스는 회원이 약관을 위반한 경우 사전 통지 후 회원 자격을 제한하거나 정지시킬 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제9조 (면책조항)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>서비스는 회원이 입력한 정보의 정확성, 신뢰성에 대해 책임지지 않습니다.</li>
                <li>서비스는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.</li>
                <li>서비스에 저장된 정보는 참고용이며, 법적 효력을 가지지 않습니다. 중요한 계약 관련 사항은 반드시 원본 서류와 전문가 상담을 통해 확인하시기 바랍니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제10조 (분쟁 해결)</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>서비스와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법률을 적용합니다.</li>
                <li>서비스와 회원 간에 발생한 분쟁에 관한 소송의 관할법원은 민사소송법에 따릅니다.</li>
              </ol>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                본 약관은 2024년 2월 13일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
