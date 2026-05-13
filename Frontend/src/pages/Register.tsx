import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

type Step = 'form' | 'otp';

export default function Register() {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // OTP state
  const [step, setStep] = useState<Step>('form');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();

  // Đếm ngược resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Bước 1: Gửi OTP ────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) { setError('Vui lòng nhập đầy đủ thông tin bắt buộc.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (!agreed) { setError('Bạn cần đồng ý với Điều khoản dịch vụ.'); return; }

    setLoading(true);
    try {
      await api.post('/auth/send-register-otp', { full_name: fullName, email, password, phone: phone || undefined });
      setStep('otp');
      setCountdown(60);
      setSuccess(`Yêu cầu đã được gửi. Vui lòng lấy mã OTP từ email quản trị: lequocthang2006.nvt@gmail.com`);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Xác thực OTP ───────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) { setError('Vui lòng nhập đủ 6 chữ số OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post<any>('/auth/verify-register-otp', { email, otp: otpCode });
      const userData = res.data?.data || res.data;
      const token = userData?.token;
      if (token) localStorage.setItem('token', token);
      setUser(userData);
      
      showToast('Chúc mừng! Tài khoản của bạn đã được khởi tạo thành công.', 'success');
      
      // Điều hướng dựa trên role sau khi đăng ký
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Mã OTP không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Gửi lại OTP ────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-register-otp', { full_name: fullName, email, password, phone: phone || undefined });
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setSuccess('Đã gửi lại mã OTP!');
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setError(err.message || 'Gửi lại OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input handler ───────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <header className="w-full px-6 lg:px-20 py-6 flex items-center justify-between border-b border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined block">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">MobileStore</h1>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:block">Đã có tài khoản?</span>
          <Link to="/login" className="px-5 py-2 text-sm font-bold border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">Đăng nhập</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[96px]"></div>
        </div>

        <div className="w-full max-w-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden relative z-10">

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
              style={{ width: step === 'form' ? '50%' : '100%' }}
            />
          </div>

          <div className="p-8 sm:p-12">
            {/* ── BƯỚC 1: FORM ── */}
            {step === 'form' && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Tạo tài khoản</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Bước 1/2 — Điền thông tin đăng ký</p>
                </div>

                {error && (
                  <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Họ và tên *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="Nguyễn Văn A"
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                        <input
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">smartphone</span>
                        <input
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="090 123 4567"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                      <input
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="Ít nhất 6 ký tự"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary" onClick={() => setShowPassword(s => !s)}>
                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Xác nhận mật khẩu *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-1">
                    <input
                      className="mt-1 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                      id="terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                    />
                    <label className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" htmlFor="terms">
                      Tôi đồng ý với <a className="text-primary hover:underline" href="#">Điều khoản dịch vụ</a> và <a className="text-primary hover:underline" href="#">Chính sách bảo mật</a>
                    </label>
                  </div>

                  <button
                    className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-purple-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang gửi OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi mã xác thực</span>
                        <span className="material-symbols-outlined text-lg">send</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── BƯỚC 2: OTP ── */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                    <span className="material-symbols-outlined text-green-500 text-3xl">mark_email_read</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Kiểm tra email</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Bước 2/2 — Nhập mã OTP gửi về</p>
                  <p className="text-primary font-semibold mt-1 text-sm">{email}</p>
                </div>

                {success && (
                  <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                    <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                  </div>
                )}
                {error && (
                  <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  {/* OTP boxes */}
                  <div className="flex gap-3 justify-center mb-8" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                          bg-slate-50 dark:bg-slate-800
                          ${digit
                            ? 'border-primary text-primary dark:text-purple-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'}
                          focus:border-primary focus:ring-2 focus:ring-primary/20`}
                      />
                    ))}
                  </div>

                  <button
                    className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-purple-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác thực & Tạo tài khoản</span>
                        <span className="material-symbols-outlined text-lg">verified_user</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={() => { setStep('form'); setError(''); setSuccess(''); setOtp(['','','','','','']); }}
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className="text-primary font-semibold disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full px-6 lg:px-20 py-8 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2024 MobileStore. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a className="hover:text-primary transition-colors" href="#">Điều khoản</a>
            <a className="hover:text-primary transition-colors" href="#">Bảo mật</a>
            <a className="hover:text-primary transition-colors" href="#">Hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
