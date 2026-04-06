import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('reset_email') || '';

  // Countdown for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => { if (i < 6) newOtp[i] = d; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => d === '');
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Vui lòng nhập đủ 6 chữ số.'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/email/verify-otp', { email, otp: code });
      sessionStorage.setItem('reset_otp', code);
      navigate('/reset-password');
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setResendLoading(true); setResendSuccess('');
    try {
      await api.post('/email/forgot-password', { email });
      setResendCountdown(60);
      setResendSuccess('Đã gửi lại mã OTP!');
      setTimeout(() => setResendSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi lại.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-20 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <Link to="/" className="flex items-center gap-3 text-primary dark:text-violet-400">
              <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined">smartphone</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">MobileStore</h2>
            </Link>
            <Link to="/forgot-password" className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          </header>

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="flex flex-col max-w-[480px] w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-primary/5 p-8 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-center mb-8">
                <div className="relative size-24 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
                  <div className="absolute -top-1 -right-1 size-8 rounded-full bg-violet-600 flex items-center justify-center border-4 border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-white text-xs">lock</span>
                  </div>
                </div>
              </div>

              <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight text-center mb-2">Xác thực mã OTP</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base text-center mb-2">
                Mã OTP đã được gửi đến
              </p>
              <p className="text-primary font-bold text-center mb-8 text-sm">{email}</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              {resendSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <p className="text-green-600 dark:text-green-400 text-sm font-semibold">{resendSuccess}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex justify-center mb-8">
                  <fieldset className="relative flex gap-2 md:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { inputRefs.current[idx] = el; }}
                        autoComplete="one-time-code"
                        className="flex h-14 w-11 md:w-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        inputMode="numeric"
                        maxLength={1}
                        type="text"
                        value={digit}
                        onChange={e => handleChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                      />
                    ))}
                  </fieldset>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang xác nhận...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác nhận</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-col items-center gap-2 mt-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Bạn chưa nhận được mã?</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCountdown > 0 || resendLoading}
                      className="text-primary dark:text-violet-400 font-semibold hover:underline flex items-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      <span>
                        {resendCountdown > 0 ? `Gửi lại sau (${resendCountdown}s)` : resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>

          <footer className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm">
            © 2024 MobileStore. Bảo mật thông tin khách hàng là ưu tiên hàng đầu của chúng tôi.
          </footer>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]"></div>
      </div>
    </div>
  );
}
