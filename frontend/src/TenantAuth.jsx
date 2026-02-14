import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useFieldValidation(formData, isLogin) {
  return useMemo(() => {
    const v = {};

    // 이름 (회원가입만)
    if (!isLogin) {
      if (formData.name.length === 0) v.name = null;
      else if (formData.name.length < 2) v.name = '이름은 2자 이상이어야 합니다.';
      else v.name = '';
    }

    // 이메일
    if (formData.email.length === 0) v.email = null;
    else if (!emailRegex.test(formData.email)) v.email = '올바른 이메일 형식이 아닙니다. (예: user@example.com)';
    else v.email = '';

    // 비밀번호
    if (formData.password.length === 0) {
      v.password = null;
    } else {
      const checks = [];
      if (formData.password.length < 8) checks.push('8자 이상');
      if (!/[A-Za-z]/.test(formData.password)) checks.push('영문 포함');
      if (!/[0-9]/.test(formData.password)) checks.push('숫자 포함');
      v.password = checks.length > 0 ? `비밀번호: ${checks.join(', ')} 필요` : '';
    }

    // 비밀번호 확인 (회원가입만)
    if (!isLogin) {
      if (formData.confirmPassword.length === 0) v.confirmPassword = null;
      else if (formData.password !== formData.confirmPassword) v.confirmPassword = '비밀번호가 일치하지 않습니다.';
      else v.confirmPassword = '';
    }

    return v;
  }, [formData, isLogin]);
}

export default function TenantAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [emailChecked, setEmailChecked] = useState(null); // null: 미확인, true: 사용가능, false: 중복
  const [emailChecking, setEmailChecking] = useState(false);

  const [saveEmail, setSaveEmail] = useState(() => localStorage.getItem('saveEmail') === 'true');
  const [autoLogin, setAutoLogin] = useState(() => localStorage.getItem('autoLogin') === 'true');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSocialTerms, setAgreeSocialTerms] = useState(false);

  const [formData, setFormData] = useState({
    email: localStorage.getItem('savedEmail') || '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const validation = useFieldValidation(formData, isLogin);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (name === 'email') setEmailChecked(null);
    setError('');
  };

  const handleCheckEmail = async () => {
    if (validation.email !== '') return;
    setEmailChecking(true);
    try {
      const res = await api.get(`/auth/check-email`, {
        params: { email: formData.email }
      });
      setEmailChecked(res.data.available);
    } catch {
      setError('이메일 중복 확인에 실패했습니다.');
    } finally {
      setEmailChecking(false);
    }
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const hasValidationErrors = Object.values(validation).some(v => v !== null && v !== '' && v !== undefined);
  const allFieldsFilled = isLogin
    ? formData.email && formData.password
    : formData.email && formData.password && formData.name && formData.confirmPassword;
  const canSubmit = allFieldsFilled && !hasValidationErrors && (isLogin || (emailChecked === true && agreeTerms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name })
      };

      await api.post(endpoint, payload);

      if (saveEmail) {
        localStorage.setItem('saveEmail', 'true');
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('saveEmail');
        localStorage.removeItem('savedEmail');
      }

      if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
      } else {
        localStorage.removeItem('autoLogin');
      }

      navigate('/before/documents');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.response?.status === 409) {
        setError('이미 등록된 이메일입니다.');
      } else {
        setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (name) => {
    const base = 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors';
    const v = validation[name];
    if (!touched[name] || v === null || v === undefined) return `${base} border-gray-300 focus:ring-purple-500 focus:border-purple-500`;
    if (v === '') return `${base} border-green-400 focus:ring-green-500 focus:border-green-500`;
    return `${base} border-red-400 focus:ring-red-500 focus:border-red-500`;
  };

  const renderHint = (name) => {
    const v = validation[name];
    if (!touched[name] || v === null || v === undefined) return null;
    if (v === '') return <p className="mt-1 text-xs text-green-600">OK</p>;
    return <p className="mt-1 text-xs text-red-600">{v}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Link to="/" className="sm:mx-auto sm:w-full sm:max-w-md text-center block cursor-pointer hover:opacity-80 transition-opacity">
        <div className="mx-auto h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-4xl border border-gray-100">
          🏠
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">내 집 기록</h2>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin ? '세입자를 위한 스마트한 주거 관리' : '계정을 생성하고 주거 기록을 시작하세요'}
        </p>
      </Link>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError(''); setTouched({}); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setTouched({}); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              회원가입
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
                <div className="mt-1">
                  <input id="name" name="name" type="text" autoComplete="name" required={!isLogin}
                    value={formData.name} onChange={handleChange} onBlur={handleBlur}
                    className={fieldClass('name')} placeholder="홍길동" />
                  {renderHint('name')}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
              <div className="mt-1 flex gap-2">
                <input id="email" name="email" type="email" autoComplete="email" required
                  value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  className={`${fieldClass('email')} flex-1`} placeholder="user@example.com" />
                {!isLogin && (
                  <button type="button" onClick={handleCheckEmail}
                    disabled={emailChecking || validation.email !== ''}
                    className="px-3 py-2 text-xs font-medium rounded-md border whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100">
                    {emailChecking ? '확인 중...' : '중복확인'}
                  </button>
                )}
              </div>
              {renderHint('email')}
              {!isLogin && emailChecked === true && (
                <p className="mt-1 text-xs text-green-600">사용 가능한 이메일입니다.</p>
              )}
              {!isLogin && emailChecked === false && (
                <p className="mt-1 text-xs text-red-600">이미 사용 중인 이메일입니다.</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="mt-1">
                <input id="password" name="password" type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"} required
                  value={formData.password} onChange={handleChange} onBlur={handleBlur}
                  className={fieldClass('password')} placeholder="••••••••" />
                {renderHint('password')}
                {!isLogin && !touched.password && (
                  <p className="mt-1 text-xs text-gray-400">영문, 숫자 포함 8자 이상</p>
                )}
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                <div className="mt-1">
                  <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
                    required={!isLogin} value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                    className={fieldClass('confirmPassword')} placeholder="••••••••" />
                  {renderHint('confirmPassword')}
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">
                    <Link to="/terms" target="_blank" className="text-purple-600 hover:text-purple-500 underline">이용약관</Link>
                    {' '}및{' '}
                    <Link to="/privacy" target="_blank" className="text-purple-600 hover:text-purple-500 underline">개인정보 처리방침</Link>
                    에 동의합니다. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={saveEmail}
                      onChange={(e) => setSaveEmail(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-xs text-gray-600">아이디 저장</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={autoLogin}
                      onChange={(e) => setAutoLogin(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-xs text-gray-600">자동 로그인</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => alert('비밀번호 찾기 기능은 준비 중입니다.\n소셜 로그인(Google, Kakao)을 이용해주세요.')}
                  className="text-xs text-gray-400 hover:text-gray-500 font-medium"
                >
                  비밀번호 찾기
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button type="submit" disabled={isLoading || !canSubmit}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLogin ? '로그인' : '계정 생성'}
              </button>
            </div>
          </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* 소셜 로그인 약관 동의 */}
              <div className="mt-6 mb-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeSocialTerms}
                    onChange={(e) => setAgreeSocialTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">
                    소셜 로그인 시{' '}
                    <Link to="/terms" target="_blank" className="text-purple-600 hover:text-purple-500 underline">이용약관</Link>
                    {' '}및{' '}
                    <Link to="/privacy" target="_blank" className="text-purple-600 hover:text-purple-500 underline">개인정보 처리방침</Link>
                    에 동의합니다.
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => window.location.href = '/oauth2/authorize/google'}
                  disabled={!agreeSocialTerms}
                  className="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google로 {isLogin ? '로그인' : '계속하기'}
                </button>
                <button
                  type="button"
                  onClick={() => window.location.href = '/oauth2/authorize/kakao'}
                  disabled={!agreeSocialTerms}
                  className="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: agreeSocialTerms ? '#FEE500' : '#FEE50080', color: '#000000D9' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000D9">
                    <path d="M12 3C6.48 3 2 6.44 2 10.61c0 2.7 1.8 5.08 4.5 6.42-.2.74-.72 2.68-.83 3.1-.13.51.19.5.4.37.16-.1 2.59-1.76 3.63-2.48.74.11 1.51.17 2.3.17 5.52 0 10-3.44 10-7.58C22 6.44 17.52 3 12 3z"/>
                  </svg>
                  카카오로 {isLogin ? '로그인' : '계속하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
