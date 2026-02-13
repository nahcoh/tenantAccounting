import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보 처리방침</h1>
          <p className="text-sm text-gray-500 mb-8">최종 수정일: 2024년 2월 13일</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <p>
                내 집 기록(이하 "서비스")은 이용자의 개인정보를 중요시하며, 개인정보 보호법 등 관련 법령을 준수하고 있습니다.
                본 개인정보 처리방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
              <p className="mb-3">서비스는 회원가입, 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다.</p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">필수 수집 항목</h4>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>이메일 주소</li>
                    <li>이름(닉네임)</li>
                    <li>비밀번호 (이메일 가입 시)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">서비스 이용 시 수집 항목</h4>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>임대차 계약 정보 (주소, 계약 기간, 보증금, 월세 등)</li>
                    <li>계약 관련 서류 (업로드 파일)</li>
                    <li>특약사항 내용</li>
                    <li>비용 정보 (공과금, 대출, 유지보수 비용 등)</li>
                    <li>체크리스트 항목</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">자동 수집 항목</h4>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>서비스 이용 기록, 접속 로그</li>
                    <li>기기 정보 (브라우저 종류, OS)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>회원 관리:</strong> 회원제 서비스 제공, 개인 식별, 부정 이용 방지</li>
                <li><strong>서비스 제공:</strong> 주거 관리 기능 제공, 계약/비용 정보 관리</li>
                <li><strong>서비스 개선:</strong> 서비스 이용 통계, 맞춤형 서비스 제공</li>
                <li><strong>고객 지원:</strong> 문의 응대, 공지사항 전달</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.</li>
                <li>단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다:
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                    <li>로그인 기록: 3개월 (통신비밀보호법)</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
              <p>
                서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 개인정보의 파기 절차 및 방법</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>파기 절차:</strong> 회원 탈퇴 요청 시 즉시 파기합니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방법으로 영구 삭제하고, 종이 문서는 분쇄하거나 소각합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 이용자의 권리와 행사 방법</h2>
              <p>이용자는 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>개인정보 열람 요청</li>
                <li>개인정보 정정 요청</li>
                <li>개인정보 삭제 요청</li>
                <li>개인정보 처리 정지 요청</li>
              </ul>
              <p className="mt-2">
                위 권리 행사는 서비스 내 설정 메뉴 또는 고객센터를 통해 가능합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 개인정보의 안전성 확보 조치</h2>
              <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>비밀번호 암호화 저장</li>
                <li>SSL/TLS를 통한 데이터 암호화 전송</li>
                <li>접근 권한 관리 및 접근 통제</li>
                <li>정기적인 보안 점검</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 쿠키의 사용</h2>
              <p>
                서비스는 로그인 유지, 서비스 이용 편의를 위해 쿠키를 사용합니다.
                이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>개인정보 보호책임자</strong></p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>담당자: 서비스 관리자</li>
                  <li>이메일: support@ziplog.kr</li>
                </ul>
              </div>
              <p className="mt-3 text-sm">
                개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
                <li>개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972)</li>
                <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
                <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. 개인정보 처리방침의 변경</h2>
              <p>
                이 개인정보 처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
                변경 시에는 시행 7일 전부터 서비스 공지사항을 통해 고지합니다.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                본 개인정보 처리방침은 2024년 2월 13일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
