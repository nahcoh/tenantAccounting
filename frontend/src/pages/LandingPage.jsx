import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Home, 
  Package, 
  Wallet, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'before',
      title: '입주 전',
      description: '복잡한 계약 서류와 체크리스트, 한곳에서 완벽하게 준비하세요.',
      icon: <ClipboardCheck className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50',
      items: ['필수 서류 관리', '계약 조건 확인', '사전 체크리스트']
    },
    {
      id: 'during',
      title: '입주 중',
      description: '거주 중 발생하는 수리 요청과 유지보수를 간편하게 기록하고 관리합니다.',
      icon: <Home className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50',
      items: ['유지보수 요청', '수리 이력 관리', '임대인 소통 기록']
    },
    {
      id: 'after',
      title: '퇴거 시',
      description: '보증금 반환부터 시설물 원상복구까지, 깔끔한 마무리를 도와드립니다.',
      icon: <Package className="w-8 h-8 text-orange-500" />,
      color: 'bg-orange-50',
      items: ['퇴거 체크리스트', '공과금 정산', '보증금 반환 관리']
    },
    {
      id: 'cost',
      title: '비용 관리',
      description: '월세, 공과금, 대출 이자 등 주거 관련 모든 지출을 체계적으로 관리하세요.',
      icon: <Wallet className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50',
      items: ['지출 캘린더', '비용 통계', '결제 리마인더']
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Ziplog
              </span>
            </div>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>똑똑한 세입자의 필수 앱</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            집 계약부터 퇴거까지,<br />
            <span className="text-blue-600">모든 과정을 기록하고 관리하세요</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            흩어져 있는 계약 서류, 잊기 쉬운 수리 내역, 복잡한 비용 관리까지.
            Ziplog가 당신의 소중한 주거 생활을 안전하게 지켜드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              지금 바로 시작하기 <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
            >
              더 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">주거 생활의 모든 단계별 케어</h2>
            <p className="text-slate-600">입주 전부터 퇴거 후까지 필요한 모든 기능을 담았습니다.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.id} 
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof/Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  더 이상 계약서 찾느라<br /> 헤매지 마세요.
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  중요한 순간에 필요한 서류와 기록, 휴대폰 하나면 충분합니다. 
                  당신의 권리를 증명하는 가장 쉬운 방법, Ziplog입니다.
                </p>
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-white text-2xl font-bold">100%</span>
                    <span className="text-slate-400 text-sm">데이터 암호화</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800 self-center"></div>
                  <div className="flex flex-col">
                    <span className="text-white text-2xl font-bold">Safe</span>
                    <span className="text-slate-400 text-sm">보안 클라우드</span>
                  </div>
                </div>
              </div>
              <div className="relative w-full md:w-1/2 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 w-full max-w-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <FileText className="text-blue-400 w-5 h-5" />
                      <span className="text-white font-medium">임대차 계약서.pdf</span>
                    </div>
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <Calendar className="text-green-400 w-5 h-5" />
                      <span className="text-white font-medium">전입신고일: 2024.03.15</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-purple-400 w-5 h-5" />
                      <span className="text-white font-medium">확정일자 완료</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
              <Home className="text-slate-600 w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-800">Ziplog</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Ziplog. 모든 권리는 보호됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
