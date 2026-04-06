import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }

    setLoading(true);
    try {
      await api.post('/email/forgot-password', { email });
      setSuccess(true);
      // Lưu email vào sessionStorage để dùng ở trang OTP
      sessionStorage.setItem('reset_email', email);
      setTimeout(() => navigate('/otp-verification'), 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between px-6 md:px-20 py-6 border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
              <span className="material-symbols-outlined text-xl">smartphone</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">MobileStore</h2>
          </Link>
          <Link to="/login" className="flex items-center justify-center size-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[480px] space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary mb-2">
                <span className="material-symbols-outlined text-4xl">lock_reset</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                Quên mật khẩu?
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-sm mx-auto">
                Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP 6 số để xác thực.
              </p>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-primary/5">
              {success ? (
                <div className="text-center space-y-4 py-4">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-lg font-bold text-green-600">Email đã được gửi!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Mã OTP đã được gửi đến <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
                    Đang chuyển hướng...
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100"
                        id="email"
                        placeholder="ten@example.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi mã OTP</span>
                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">send</span>
                      </>
                    )}
                  </button>
                </form>
              )}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors" to="/login">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>Quay lại đăng nhập</span>
                </Link>
              </div>
            </div>

            {/* Footer info */}
            <div className="text-center space-y-4 opacity-60">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="text-xs font-medium uppercase tracking-widest">Bảo mật 256-bit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  <span className="text-xs font-medium uppercase tracking-widest">Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Decorative Background */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        </div>
      </div>
    </div>
  );
}
